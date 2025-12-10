#!/usr/bin/env python3
"""
Script de prueba para las nuevas funciones TDR
"""
import sys
import os
sys.path.append('.')

from main import process_csv_file, detect_pulse_events, calculate_temporal_parameters
import numpy as np

def test_csv_processing():
    """Prueba el procesamiento de archivos CSV"""
    print("=== PRUEBA DE PROCESAMIENTO CSV ===")

    csv_path = '../Csv/taller 3/SDS00001.csv'
    if not os.path.exists(csv_path):
        print(f"Archivo no encontrado: {csv_path}")
        return None, None, None

    try:
        # Crear un mock UploadFile
        class MockUploadFile:
            def __init__(self, filepath, filename):
                self.file = open(filepath, 'rb')
                self.filename = filename

        mock_file = MockUploadFile(csv_path, 'SDS00001.csv')
        time, voltage, config = process_csv_file(mock_file)
        mock_file.file.close()

        print("[OK] Procesamiento CSV exitoso")
        print(f"  Puntos de tiempo: {len(time)}")
        print(f"  Puntos de voltaje: {len(voltage)}")
        print(f"  Configuración: {config}")
        print(f"  Tiempo inicial: {time[0]:.2e} s")
        print(f"  Voltaje máximo: {max(voltage):.3f} V")
        print(f"  Voltaje mínimo: {min(voltage):.3f} V")
        return time, voltage, config

    except Exception as e:
        print(f"[ERROR] Error en procesamiento CSV: {e}")
        import traceback
        traceback.print_exc()
        return None, None, None

def test_event_detection(time, voltage, config):
    """Prueba la detección de eventos"""
    print("\n=== PRUEBA DE DETECCIÓN DE EVENTOS ===")

    try:
        events = detect_pulse_events(time, voltage, config)
        print("[OK] Detección de eventos exitosa")
        print(f"  t0: {events['t0']:.2e} s")
        print(f"  Rise time: {events['rise_time']:.2e} s")
        print(f"  f_eff: {events['f_eff']:.2e} Hz")
        print(f"  V_max: {events['v_max']:.3f} V")
        if events['plateau_start']:
            print(f"  Plateau: {events['plateau_start']:.2e} - {events['plateau_end']:.2e} s")
        return events

    except Exception as e:
        print(f"[ERROR] Error en detección de eventos: {e}")
        import traceback
        traceback.print_exc()
        return None

def test_temporal_calculations(events, cable_length):
    """Prueba los cálculos temporales"""
    print("\n=== PRUEBA DE CÁLCULOS TEMPORALES ===")

    try:
        temporal_params = calculate_temporal_parameters(events, cable_length)
        print("[OK] Cálculos temporales exitosos")
        print(f"  Dt: {temporal_params['dt']:.2e} s")
        print(f"  vp: {temporal_params['vp']:.2e} m/s")
        print(f"  Velocity factor: {temporal_params['velocity_factor']:.2f}%")
        print(f"  epsilon_eff: {temporal_params['epsilon_eff']:.2f}")
        return temporal_params

    except Exception as e:
        print(f"[ERROR] Error en cálculos temporales: {e}")
        import traceback
        traceback.print_exc()
        return None

def test_attenuation_calculations(time, voltage, events, temporal_params):
    """Prueba los cálculos de atenuación"""
    print("\n=== PRUEBA DE CÁLCULOS DE ATENUACIÓN ===")

    try:
        from main import calculate_attenuation
        attenuation_params = calculate_attenuation(voltage, time, events, temporal_params)
        print("[OK] Cálculos de atenuación exitosos")
        print(f"  Alpha: {attenuation_params['alpha']:.2e} Np/m")
        print(f"  Beta: {attenuation_params['beta']:.2e} rad/m")
        return attenuation_params

    except Exception as e:
        print(f"[ERROR] Error en cálculos de atenuación: {e}")
        import traceback
        traceback.print_exc()
        return None

if __name__ == "__main__":
    print("INICIANDO PRUEBAS TDR\n")

    # Prueba 1: Procesamiento CSV
    time, voltage, config = test_csv_processing()
    if time is None:
        sys.exit(1)

    # Prueba 2: Detección de eventos
    events = test_event_detection(time, voltage, config)
    if events is None:
        sys.exit(1)

    # Prueba 3: Cálculos temporales
    cable_length = 10.0  # metros
    temporal_params = test_temporal_calculations(events, cable_length)
    if temporal_params is None:
        sys.exit(1)

    # Prueba 4: Cálculos de atenuación
    attenuation_params = test_attenuation_calculations(time, voltage, events, temporal_params)
    if attenuation_params is None:
        sys.exit(1)

    print("\n[SUCCESS] TODAS LAS PRUEBAS PASARON EXITOSAMENTE!")