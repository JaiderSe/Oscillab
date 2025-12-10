![Fondo](fondo.png)

# OscilloData Lab - TDR Analysis System

Un sistema profesional de análisis de datos de osciloscopio con especialización en Time Domain Reflectometry (TDR) para análisis de líneas de transmisión.
## 👾 Funcionamiento
[Video](https://udistritaleduco-my.sharepoint.com/:v:/g/personal/jsmorenoq_udistrital_edu_co/IQDt0P0fWHtBT5bpIFfubv7nAV_QmtUawlpYdSOLcEg22e4?e=77tzjK&nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJTdHJlYW1XZWJBcHAiLCJyZWZlcnJhbFZpZXciOiJTaGFyZURpYWxvZy1MaW5rIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXcifX0%3D)
## 🚀 Características

### Análisis TDR Completo
- **Detección automática de pulsos** - Algoritmos avanzados para identificar eventos en señales TDR
- **Análisis temporal** - Cálculos precisos de velocidad de propagación y factor de velocidad
- **Análisis de impedancia** - Determinación automática de impedancia característica y tipo de carga
- **Análisis de reflexión** - Coeficiente de reflexión, VSWR y caracterización de cargas
- **Análisis de atenuación** - Cálculos de constantes alpha (α) y beta (β)

### Interfaz de Usuario
- **Gráfica interactiva** con Recharts - Visualización de waveforms con tooltips
- **Controles de escala** vertical y horizontal
- **Tabla de métricas** con notación científica para valores pequeños
- **Subida de archivos CSV** con soporte para headers de osciloscopio
- **Asistente virtual** integrado con Botpress

### Backend Robusto
- **API REST** con FastAPI
- **Procesamiento de CSV** con headers de configuración de osciloscopio
- **Cálculos científicos** usando NumPy, SciPy y Matplotlib
- **Validación de datos** y manejo de errores
- **CORS configurado** para desarrollo local

## 🏗️ Arquitectura

```
├── backend/                 # API Backend (FastAPI)
│   ├── main.py             # Servidor principal y endpoints
│   ├── requirements.txt    # Dependencias Python
│   └── README.md          # Documentación del backend
├── frontend/               # Aplicación React
│   ├── src/
│   │   ├── components/     # Componentes React
│   │   ├── services/       # Servicios API
│   │   └── types.ts        # Definiciones TypeScript
│   ├── package.json        # Dependencias Node.js
│   └── vite.config.ts      # Configuración Vite
├── Csv/                    # Archivos de ejemplo CSV
└── test_tdr.py            # Script de pruebas
```

## 📋 Prerrequisitos

- **Python 3.8+**
- **Node.js 18+**
- **npm o yarn**

## 🚀 Instalación y Ejecución

### 1. Clonar el repositorio
```bash
git clone <repository-url>
cd oscillodata-lab
```

### 2. Configurar el Backend

```bash
# Instalar dependencias
cd backend
pip install -r requirements.txt

# Ejecutar el servidor
python main.py
```

El backend estará disponible en `http://localhost:8000`

### 3. Configurar el Frontend

```bash
# Instalar dependencias
cd frontend
npm install

# Configurar API key (opcional, para funcionalidades futuras)
cp .env.local.example .env.local
# Editar .env.local con tu GEMINI_API_KEY si es necesario

# Ejecutar el servidor de desarrollo
npm run dev
```

El frontend estará disponible en `http://localhost:3000`

## 📊 Uso

### Análisis de Archivos CSV

1. **Preparar archivo CSV**: Asegúrate de que contenga headers de configuración de osciloscopio
2. **Subir archivo**: Usa el botón "Select CSV File" en la interfaz
3. **Configurar parámetros**:
   - **Cable Length**: Longitud física del cable en metros
   - **Z0 Expected**: Impedancia característica esperada en ohmios
4. **Analizar**: Haz clic en "Analizar" para procesar los datos
5. **Visualizar resultados**:
   - Gráfica interactiva de la waveform TDR
   - Tabla completa de métricas calculadas
   - Análisis detallado en el panel lateral

### Métricas Calculadas

| Parámetro | Descripción | Unidad |
|-----------|-------------|--------|
| `length_meters` | Longitud calculada del cable | m |
| `error_percent` | Error porcentual en la medición | % |
| `velocity_factor` | Factor de velocidad de propagación | % |
| `vswr` | Voltage Standing Wave Ratio | - |
| `reflection_coefficient` | Coeficiente de reflexión | - |
| `beta` | Constante de fase | rad/m |
| `alpha` | Constante de atenuación | Np/m |
| `Z0` | Impedancia característica | Ω |
| `load_type` | Tipo de carga detectada | - |
| `load_value` | Valor de la carga | Ω/pF |

## 🔧 Configuración

### Variables de Entorno

Crear archivo `.env.local` en la carpeta `frontend/`:

```env
GEMINI_API_KEY=your_api_key_here
```

### Configuración del Backend

El backend incluye configuración CORS automática para desarrollo local. Para producción, ajustar los orígenes permitidos en `backend/main.py`.

## 🧪 Pruebas

### Ejecutar pruebas del backend
```bash
cd backend
python test_tdr.py
```

### Probar API manualmente
```bash
# Verificar que el backend responde
curl http://localhost:8000/

# Probar análisis TDR
curl -X POST \
  -F "file=@Csv/taller_3/SDS00001.csv" \
  -F "cable_length=1.5" \
  -F "z0_expected=50" \
  http://localhost:8000/analyze-tdr
```

## 📁 Estructura de Archivos CSV

Los archivos CSV deben tener el formato estándar de osciloscopio con headers de configuración:

```
Sample Interval,2.0000000000000003e-10
Vertical Scale,1.0
Vertical Offset,0.0
Horizontal Scale,1e-06
[datos CSV con columnas: tiempo, voltaje]
```

## 🤖 Asistente Virtual

El sistema incluye un asistente virtual basado en Botpress que puede ayudar con:
- Explicación de conceptos TDR
- Interpretación de resultados
- Guía de uso del sistema
- Resolución de problemas comunes

## 🛠️ Desarrollo

### Comandos disponibles

```bash
# Backend
cd backend
pip install -r requirements.txt  # Instalar dependencias
python main.py                  # Ejecutar servidor
python test_tdr.py             # Ejecutar pruebas

# Frontend
cd frontend
npm install                    # Instalar dependencias
npm run dev                    # Servidor de desarrollo
npm run build                  # Build de producción
npm run preview                # Vista previa de producción
```

### Contribuir

1. Fork el proyecto
2. Crear rama para feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## 👥 Autores

- **Equipo de Desarrollo** 
- Jaider Moreno
- Alejandra Pedraza
- Miguel Castillo 



## 🙏 Agradecimientos

- FastAPI por el framework backend
- React y Vite por el framework frontend
- Recharts para las gráficas interactivas
- SciPy y NumPy para los cálculos científicos
- Botpress por el asistente virtual
