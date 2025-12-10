from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

import uvicorn

import pandas as pd
import numpy as np
from scipy.signal import savgol_filter, find_peaks, correlate
import scipy.fft
import cmath
import matplotlib.pyplot as plt
import io
import base64
from typing import Tuple, Dict, List

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AnalyzeTDRResponse(BaseModel):
    length_meters: float
    error_percent: float
    velocity_factor: float
    vswr: float
    reflection_coefficient: float
    beta: float
    alpha: float
    Z0: float
    load_type: str
    load_value: float
    tdr_plot_base64: str
    waveform: list

def process_csv_file(file: UploadFile) -> Tuple[np.ndarray, np.ndarray, Dict[str, float]]:
    """
    Procesa archivo CSV con cabeceras de configuración del osciloscopio.
    Retorna tiempo, voltaje y parámetros de configuración.
    """
    try:
        # Leer todas las líneas para extraer cabeceras
        content = file.file.read().decode('utf-8')
        lines = content.split('\n')

        # Extraer parámetros de configuración
        config = {}
        for line in lines[:11]:  # Primeras 11 líneas son cabeceras
            if ':' in line:
                key, value = line.split(':', 1)
                key = key.strip()
                value = value.strip()

                # Extraer valores numéricos
                if 'Sample Interval' in key:
                    config['sample_interval'] = float(value.split(',')[0])
                elif 'Vertical Scale' in key:
                    config['vertical_scale'] = float(value.split(',')[0])
                elif 'Vertical Offset' in key:
                    config['vertical_offset'] = float(value.split(',')[0])
                elif 'Horizontal Scale' in key:
                    config['horizontal_scale'] = float(value)

        # Leer datos a partir de la línea 12
        df = pd.read_csv(io.StringIO('\n'.join(lines[11:])), header=None)
    except Exception as e:
        raise ValueError(f"Failed to read CSV file: {str(e)}")

    if df.shape[1] < 2:
        raise ValueError("CSV must have at least two columns")

    # Convertir columnas a numéricas
    try:
        time = pd.to_numeric(df.iloc[:, 0], errors='coerce').values
        voltage = pd.to_numeric(df.iloc[:, 1], errors='coerce').values
    except Exception as e:
        raise ValueError(f"Columns must contain numeric data: {str(e)}")

    # Debug: verificar valores no numéricos
    nan_time = np.sum(np.isnan(time))
    nan_voltage = np.sum(np.isnan(voltage))

    if nan_time > 0 or nan_voltage > 0:
        print(f"DEBUG: Found {nan_time} NaN values in time, {nan_voltage} NaN values in voltage")
        # Mostrar algunas líneas problemáticas
        problematic_rows = []
        for i in range(min(10, len(df))):
            try:
                t_val = float(df.iloc[i, 0])
                v_val = float(df.iloc[i, 1])
            except (ValueError, TypeError):
                problematic_rows.append((i, df.iloc[i, 0], df.iloc[i, 1]))

        if problematic_rows:
            print("DEBUG: Problematic rows (first 5):")
            for row_idx, t_str, v_str in problematic_rows[:5]:
                print(f"  Row {row_idx}: time='{t_str}', voltage='{v_str}'")

        # Intentar limpiar los datos eliminando filas con NaN
        valid_mask = ~(np.isnan(time) | np.isnan(voltage))
        if np.sum(valid_mask) < len(time) * 0.8:  # Si perdemos más del 20% de datos
            raise ValueError(f"Too many invalid values: {np.sum(~valid_mask)}/{len(time)} rows contain NaN")

        time = time[valid_mask]
        voltage = voltage[valid_mask]
        print(f"DEBUG: Cleaned data, remaining {len(time)} valid points")

    # Aplicar corrección de offset si existe
    if 'vertical_offset' in config:
        voltage = voltage + config['vertical_offset']

    # Suavizar señal usando filtro Savitzky-Golay
    window_length = min(51, len(voltage) // 2 * 2 + 1)  # Asegurar número impar
    if window_length > 2:
        voltage_smooth = savgol_filter(voltage, window_length, 3)
    else:
        voltage_smooth = voltage

    return time, voltage_smooth, config

def detect_pulse_events(time: np.ndarray, voltage: np.ndarray, config: Dict[str, float]) -> Dict[str, float]:
    """
    Detecta automáticamente eventos en la señal TDR.
    Retorna parámetros temporales del pulso.
    """
    # Encontrar inicio del pulso incidente (10% del máximo)
    v_max = np.max(voltage)
    threshold = 0.1 * v_max

    # Encontrar primer cruce del umbral
    above_threshold = voltage > threshold
    if not np.any(above_threshold):
        raise ValueError("No se detectó pulso incidente")

    t0_idx = np.where(above_threshold)[0][0]
    t0 = time[t0_idx]

    # Encontrar tiempo de subida (10% a 90%)
    v_10 = 0.1 * v_max
    v_90 = 0.9 * v_max

    idx_10 = np.where(voltage >= v_10)[0][0]
    idx_90 = np.where(voltage >= v_90)[0][0]

    t_10 = time[idx_10]
    t_90 = time[idx_90]
    rise_time = t_90 - t_10

    # Frecuencia efectiva del pulso
    f_eff = 0.35 / rise_time if rise_time > 0 else 0

    # Detectar meseta (región donde derivada ≈ 0)
    dv_dt = np.gradient(voltage, time)
    plateau_mask = np.abs(dv_dt) < (v_max / len(time)) * 0.01  # Umbral bajo

    # Encontrar segmentos continuos de meseta
    plateau_segments = []
    in_plateau = False
    start_idx = 0

    for i in range(len(plateau_mask)):
        if plateau_mask[i] and not in_plateau:
            in_plateau = True
            start_idx = i
        elif not plateau_mask[i] and in_plateau:
            in_plateau = False
            duration = time[i-1] - time[start_idx]
            if duration >= 20e-9:  # Mínimo 20 ns
                plateau_segments.append((start_idx, i-1, duration))

    # Usar la meseta más larga después del frente de subida
    plateau_start = plateau_end = None
    if plateau_segments:
        # Filtrar mesetas que empiecen después del 90% del pulso
        valid_plateaus = [p for p in plateau_segments if time[p[0]] > t_90]
        if valid_plateaus:
            best_plateau = max(valid_plateaus, key=lambda x: x[2])
            plateau_start = time[best_plateau[0]]
            plateau_end = time[best_plateau[1]]

    # Detectar reflexión
    reflection_start = None
    if plateau_end:
        # Buscar cambio brusco después de la meseta
        post_plateau = voltage[time > plateau_end]
        time_post = time[time > plateau_end]

        if len(post_plateau) > 10:
            dv_dt_post = np.abs(np.gradient(post_plateau, time_post))
            threshold_reflection = np.max(dv_dt_post) * 0.5

            reflection_idx = np.where(dv_dt_post > threshold_reflection)[0]
            if len(reflection_idx) > 0:
                reflection_start = time_post[reflection_idx[0]]

    return {
        't0': t0,
        'rise_time': rise_time,
        'f_eff': f_eff,
        'plateau_start': plateau_start,
        'plateau_end': plateau_end,
        'reflection_start': reflection_start,
        'v_max': v_max
    }

def calculate_temporal_parameters(events: Dict[str, float], cable_length: float, c: float = 299792458) -> Dict[str, float]:
    """
    Calcula parámetros temporales y de línea según especificaciones TDR.
    """
    dt = None

    # Método 1: Si hay meseta → Δt = fin_meseta - inicio_pulso
    if events['plateau_end'] and events['t0']:
        dt = events['plateau_end'] - events['t0']

    # Método 2: Si hay reflexión detectada
    elif events['reflection_start'] and events['t0']:
        dt = events['reflection_start'] - events['t0']

    # Método 3: Usar tiempo donde señal alcanza 90% del máximo
    else:
        # Buscar tiempo donde señal alcanza 90% del máximo después del pulso
        t_90_max = None
        for t, v in zip(np.linspace(events['t0'], events['t0'] + 1e-6, 1000), np.linspace(0, events['v_max'], 1000)):
            if v >= 0.9 * events['v_max']:
                t_90_max = t
                break
        if t_90_max:
            dt = t_90_max - events['t0']

    if dt is None or dt <= 0:
        raise ValueError("No se pudo calcular Δt")

    # Velocidad de propagación
    vp = (2 * cable_length) / dt

    # Coeficiente de velocidad (porcentaje)
    velocity_factor = (vp / c) * 100

    # Permitividad relativa efectiva
    epsilon_eff = (c / vp) ** 2

    return {
        'dt': dt,
        'vp': vp,
        'velocity_factor': velocity_factor,
        'epsilon_eff': epsilon_eff
    }


def analyze_impedance_reflection(voltage: np.ndarray, time: np.ndarray, events: Dict[str, float],
                               temporal_params: Dict[str, float], z0_expected: float) -> Dict[str, float]:
    """
    Analiza impedancia y coeficiente de reflexión.
    """
    # Voltaje incidente (promedio en meseta o valor estable)
    if events['plateau_start'] and events['plateau_end']:
        # Usar promedio en la meseta
        plateau_mask = (time >= events['plateau_start']) & (time <= events['plateau_end'])
        vi = np.mean(voltage[plateau_mask])
    else:
        # Usar valor estable después del tiempo de propagación
        stable_time = events['t0'] + temporal_params['dt']
        stable_mask = time >= stable_time
        if np.any(stable_mask):
            vi = np.mean(voltage[stable_mask][:10])  # Promedio primeros 10 puntos estables
        else:
            vi = events['v_max'] * 0.8  # Valor aproximado

    # Voltaje reflejado
    if events['reflection_start']:
        reflection_mask = time >= events['reflection_start']
        if np.any(reflection_mask):
            vr = voltage[reflection_mask][0] - vi
        else:
            vr = 0
    else:
        # Si no hay reflexión clara, asumir adaptación
        vr = 0

    # Coeficiente de reflexión
    reflection_coeff = vr / vi if vi != 0 else 0

    # VSWR
    gamma_abs = abs(reflection_coeff)
    vswr = (1 + gamma_abs) / (1 - gamma_abs) if gamma_abs < 1 else 1e10

    # Tipo de carga
    if abs(reflection_coeff) < 0.1:
        load_type = "matched"
        load_value = z0_expected
    elif reflection_coeff > 0:
        load_type = "open"
        load_value = z0_expected * (1 + reflection_coeff) / (1 - reflection_coeff)
    else:
        load_type = "short"
        load_value = z0_expected * (1 + reflection_coeff) / (1 - reflection_coeff)

    return {
        'vi': vi,
        'vr': vr,
        'reflection_coefficient': reflection_coeff,
        'vswr': vswr,
        'load_type': load_type,
        'load_value': load_value,
        'z0': z0_expected
    }


def calculate_attenuation(voltage: np.ndarray, time: np.ndarray, events: Dict[str, float],
                         temporal_params: Dict[str, float]) -> Dict[str, float]:
    """
    Calcula parámetros de atenuación y pérdidas.
    """
    # Para TDR, alpha y beta son más difíciles de calcular directamente
    # Usaremos aproximaciones basadas en la teoría de líneas de transmisión

    # Alpha (atenuación): Para señales TDR cortas, es pequeño
    # Usar una estimación más realista basada en el decaimiento de la señal
    if len(voltage) > 50:
        # Calcular atenuación usando regresión lineal en escala logarítmica
        # para el decaimiento de reflexiones múltiples (si existen)
        v_abs = np.abs(voltage)
        v_max = events.get('v_max', 1)

        # Encontrar puntos donde la señal está decayendo (después del pulso principal)
        t0 = events.get('t0', 0)
        decay_mask = time > (t0 + temporal_params.get('dt', 0))

        if np.sum(decay_mask) > 10:
            decay_voltage = v_abs[decay_mask]
            decay_time = time[decay_mask]

            # Calcular alpha usando el método de mínimos cuadrados en escala log
            if len(decay_voltage) > 5 and np.all(decay_voltage > 0):
                log_v = np.log(decay_voltage / v_max)
                # Regresión lineal: log(V) = -alpha * t + c
                coeffs = np.polyfit(decay_time, log_v, 1)
                alpha = -coeffs[0]  # alpha = -slope
            else:
                alpha = 1e-3  # Valor típico pequeño para cables de buena calidad
        else:
            alpha = 1e-3  # Valor típico
    else:
        alpha = 1e-3

    # Beta (constante de fase): 2π/λ = β, donde λ = vp/f
    # Para TDR, podemos estimar beta usando la frecuencia del pulso
    f_eff = events.get('f_eff', 1e7)  # Frecuencia efectiva del pulso
    vp = temporal_params.get('vp', 2e8)

    if vp > 0 and f_eff > 0:
        wavelength = vp / f_eff
        beta = 2 * np.pi / wavelength if wavelength > 0 else 0
    else:
        beta = 1e-3  # Valor típico pequeño

    # Asegurar que los valores sean positivos y razonables
    alpha = max(alpha, 1e-6)  # Mínimo 1e-6 Np/m
    beta = max(beta, 1e-6)    # Mínimo 1e-6 rad/m

    return {
        'alpha': alpha,
        'beta': beta
    }


def analyze_load_type(reflection_coeff: complex) -> str:
    """
    Identifica tipo de carga basado en el coeficiente de reflexión.
    """
    gamma_abs = abs(reflection_coeff)

    if gamma_abs < 0.1:
        return "matched"
    elif gamma_abs > 0.9:
        phase = np.angle(reflection_coeff)
        if phase > 0:
            return "open"
        else:
            return "short"
    else:
        phase = np.angle(reflection_coeff)
        if phase > 0:
            return "capacitive"
        else:
            return "inductive"


def calculate_error_analysis(temporal_params: Dict[str, float], cable_length: float,
                           config: Dict[str, float]) -> Dict[str, float]:
    """
    Calcula análisis de errores e incertidumbre.
    """
    dt = temporal_params['dt']
    vp = temporal_params['vp']

    # Error en medición de tiempo
    sample_interval = config.get('sample_interval', 1e-9)
    dt_error = sample_interval + 0.05 * dt  # 5% estimado

    # Error en longitud del cable (asumir 1% de precisión)
    length_error = 0.01 * cable_length

    # Error en velocidad de propagación
    vp_error = vp * np.sqrt((length_error/cable_length)**2 + (dt_error/dt)**2)

    # Error en factor de velocidad
    vf_error = (vp_error / 299792458) * 100

    return {
        'dt_error': dt_error,
        'vp_error': vp_error,
        'vf_error': vf_error,
        'error_percent': (vp_error / vp) * 100
    }


def generate_tdr_plot_base64(time_data, magnitude_data):
    plt.figure()
    plt.plot(time_data, magnitude_data)
    plt.xlabel('Time')
    plt.ylabel('Magnitude')
    plt.title('TDR Waveform')
    buf = io.BytesIO()
    plt.savefig(buf, format='png')
    buf.seek(0)
    img_base64 = base64.b64encode(buf.read()).decode('utf-8')
    plt.close()
    return img_base64


@app.post("/analyze-tdr", response_model=AnalyzeTDRResponse)
async def analyze_tdr(
    file: UploadFile = File(...),
    cable_length: float = Form(...),
    z0_expected: float = Form(50.0)
):
    print(f"DEBUG: Received analyze-tdr request for file: {file.filename}, cable_length: {cable_length}")

    # Validar entradas
    if not file.filename.lower().endswith('.csv'):
        raise HTTPException(status_code=400, detail="Uploaded file must be a CSV file")
    if cable_length <= 0:
        raise HTTPException(status_code=400, detail="cable_length must be greater than 0")
    if z0_expected <= 0:
        raise HTTPException(status_code=400, detail="z0_expected must be greater than 0")

    try:
        print("DEBUG: Processing CSV file...")
        # Procesar CSV con configuración
        time, voltage, config = process_csv_file(file)
        print(f"DEBUG: CSV processed successfully. Time points: {len(time)}, Config: {config}")

        print("DEBUG: Detecting pulse events...")
        # Detectar eventos del pulso
        events = detect_pulse_events(time, voltage, config)
        print(f"DEBUG: Events detected: {events}")

        print("DEBUG: Calculating temporal parameters...")
        # Calcular parámetros temporales y de línea
        temporal_params = calculate_temporal_parameters(events, cable_length)
        print(f"DEBUG: Temporal parameters: {temporal_params}")

        print("DEBUG: Analyzing impedance and reflection...")
        # Analizar impedancia y reflexión
        impedance_params = analyze_impedance_reflection(voltage, time, events, temporal_params, z0_expected)
        print(f"DEBUG: Impedance parameters: {impedance_params}")

        print("DEBUG: Calculating attenuation...")
        # Calcular atenuación
        attenuation_params = calculate_attenuation(voltage, time, events, temporal_params)
        print(f"DEBUG: Attenuation parameters: {attenuation_params}")

        print("DEBUG: Analyzing errors...")
        # Análisis de errores
        error_params = calculate_error_analysis(temporal_params, cable_length, config)
        print(f"DEBUG: Error analysis: {error_params}")

        print("DEBUG: Generating plot...")
        # Generar gráfica
        tdr_plot_base64 = generate_tdr_plot_base64(time, voltage)
        print("DEBUG: Plot generated successfully")

        # Preparar respuesta
        data = {
            "length_meters": cable_length,  # Usar longitud física proporcionada
            "error_percent": error_params['error_percent'],
            "velocity_factor": temporal_params['velocity_factor'],
            "vswr": impedance_params['vswr'],
            "reflection_coefficient": impedance_params['reflection_coefficient'],
            "beta": attenuation_params['beta'],
            "alpha": attenuation_params['alpha'],
            "Z0": impedance_params['z0'],
            "load_type": impedance_params['load_type'],
            "load_value": impedance_params['load_value'],
            "tdr_plot_base64": tdr_plot_base64,
            "waveform": [{"time": float(t), "ch1": float(v)} for t, v in zip(time, voltage)]
        }

        # Reemplazar valores infinitos por valores grandes para compatibilidad JSON
        for k, v in data.items():
            if isinstance(v, float) and not np.isfinite(v):
                data[k] = 1e10 if v == float('inf') else -1e10 if v == float('-inf') else 0.0

        return AnalyzeTDRResponse(**data)

    except ValueError as e:
        print(f"DEBUG: ValueError: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        print(f"DEBUG: Exception: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Processing error: {str(e)}")


@app.post("/upload-csv")
async def upload_csv(file: UploadFile = File(...)):
    print(f"DEBUG: upload-csv called with file: {file.filename}")
    try:
        time_array, voltage_array, config = process_csv_file(file)
        print(f"DEBUG: upload-csv processed {len(time_array)} points, config: {config}")
        return {
            "time": time_array.tolist(),
            "magnitude": voltage_array.tolist(),
            "config": config
        }
    except ValueError as e:
        print(f"DEBUG: upload-csv ValueError: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        print(f"DEBUG: upload-csv Exception: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Processing error: {str(e)}")

@app.get("/")
def read_root():
    return {"message": "Hello World"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)