# Análisis de Sentimientos en Conversaciones para Inducascos

## Descripción

Este proyecto implementa un backend robusto utilizando **FastAPI** para analizar el sentimiento de conversaciones almacenadas en una base de datos MySQL. El sistema permite evaluar la satisfacción del cliente, identificar posibles problemas que generen frustración o descontento, y monitorear el rendimiento de los agentes a través de un análisis de sentimientos detallado. Además, la API ofrece endpoints avanzados con múltiples filtros para consultas tanto cualitativas como cuantitativas.

## Tabla de Contenidos

- [Características](#características)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Requisitos](#requisitos)
- [Instalación](#instalación)
- [Configuración de la Base de Datos](#configuración-de-la-base-de-datos)
- [Uso](#uso)
- [Endpoints de la API](#endpoints-de-la-api)
  - [Obtener Mensajes con Sentimiento](#obtener-mensajes-con-sentimiento)
  - [Obtener Resumen de Sentimientos](#obtener-resumen-de-sentimientos)
- [Ejemplos de Uso](#ejemplos-de-uso)
- [Notas Adicionales](#notas-adicionales)
- [Contribuciones](#contribuciones)
- [Licencia](#licencia)

## Características

- **Análisis de Sentimiento en Tiempo Real**: Utiliza el modelo VADER de NLTK para identificar el tono de los mensajes (positivo, negativo, neutral).
- **Filtros Avanzados**: Permite filtrar los datos por múltiples campos como nombre del agente, cliente, canal de comunicación, remitente, y rango de fechas.
- **Datos Cualitativos y Cuantitativos**: Proporciona acceso a los mensajes individuales con su análisis de sentimiento y a un resumen agregado de los sentimientos.
- **Estructura Modular**: Código organizado en múltiples archivos para facilitar el mantenimiento y la escalabilidad.
- **Modelos Pydantic**: Define modelos de datos para asegurar la integridad y validación de las respuestas.

## Estructura del Proyecto

```
your_project/
├── main.py
├── routers/
│   └── sentiments.py
├── models/
│   ├── schemas.py
│   └── database.py
└── utils/
    └── sentiment_analysis.py
```

## Requisitos

- **Python**: Versión 3.7 o superior
- **MySQL**: Base de datos para almacenar las conversaciones
- **Dependencias Python**:
  - FastAPI
  - Uvicorn
  - NLTK
  - mysql-connector-python

## Instalación

1. **Clonar el Repositorio**:

   ```bash
   git clone https://github.com/tu_usuario/tu_repositorio.git
   cd tu_repositorio
   ```

2. **Crear un Entorno Virtual** (Opcional pero recomendado):

   ```bash
   python -m venv venv
   source venv/bin/activate  # En Windows: venv\Scripts\activate
   ```

3. **Instalar las Dependencias**:

   ```bash
   pip install -r requirements.txt
   ```

   *Si no tienes un archivo `requirements.txt`, puedes instalar las dependencias manualmente:*

   ```bash
   pip install fastapi uvicorn nltk mysql-connector-python
   ```

4. **Descargar Recursos de NLTK**:

   El análisis de sentimiento utiliza el lexicón VADER de NLTK. Asegúrate de descargar los recursos necesarios ejecutando el siguiente script en Python:

   ```python
   import nltk
   nltk.download('vader_lexicon')
   ```

## Configuración de la Base de Datos

1. **Crear la Base de Datos y la Tabla**:

   Asegúrate de tener una base de datos MySQL creada con una tabla `conversaciones` que contenga los siguientes campos:

   - `conn_id` (VARCHAR)
   - `agent_name` (VARCHAR)
   - `customer_name` (VARCHAR)
   - `channel` (VARCHAR)
   - `de` (VARCHAR)
   - `from_name` (VARCHAR)
   - `to_name` (VARCHAR)
   - `date` (DATETIME)
   - `message` (TEXT)

2. **Actualizar las Credenciales de la Base de Datos**:

   Edita el archivo `models/database.py` con tus credenciales de MySQL:

   ```python
   # models/database.py

   import mysql.connector

   def get_db_connection():
       mydb = mysql.connector.connect(
           host="localhost",
           user="tu_usuario",
           password="tu_contraseña",
           database="nombre_de_la_base_de_datos"
       )
       return mydb
   ```

## Uso

1. **Ejecutar la Aplicación**:

   Desde la raíz del proyecto, ejecuta:

   ```bash
   uvicorn main:app --reload
   ```

   La aplicación estará disponible en `http://127.0.0.1:8000`.

2. **Acceder a la Documentación Interactiva**:

   FastAPI genera automáticamente documentación interactiva. Accede a:

   - Swagger UI: `http://127.0.0.1:8000/docs`
   - Redoc: `http://127.0.0.1:8000/redoc`

## Endpoints de la API

### Obtener Mensajes con Sentimiento

- **URL**: `/sentimientos`
- **Método**: `GET`
- **Descripción**: Obtiene una lista de mensajes con su análisis de sentimiento.
- **Parámetros de Consulta** (Opcionales):
  - `agent_name` (str): Filtra por nombre del agente.
  - `customer_name` (str): Filtra por nombre del cliente.
  - `channel` (str): Filtra por canal de comunicación.
  - `de` (str): Filtra por remitente del mensaje.
  - `date_from` (datetime): Filtra mensajes desde esta fecha.
  - `date_to` (datetime): Filtra mensajes hasta esta fecha.
  - `sentiment` (str): Filtra por tipo de sentimiento (`positivo`, `negativo`, `neutral`).
- **Respuesta**: Lista de objetos `MensajeConSentimiento` que incluyen detalles del mensaje y su análisis de sentimiento.

### Obtener Resumen de Sentimientos

- **URL**: `/sentimientos/resumen`
- **Método**: `GET`
- **Descripción**: Proporciona un resumen cuantitativo del análisis de sentimiento.
- **Parámetros de Consulta** (Opcionales):
  - `agent_name` (str): Filtra por nombre del agente.
  - `customer_name` (str): Filtra por nombre del cliente.
  - `channel` (str): Filtra por canal de comunicación.
  - `de` (str): Filtra por remitente del mensaje.
  - `date_from` (datetime): Filtra mensajes desde esta fecha.
  - `date_to` (datetime): Filtra mensajes hasta esta fecha.
- **Respuesta**: Objeto `SentimentSummary` con el total de mensajes y el conteo de mensajes positivos, neutrales y negativos.

## Ejemplos de Uso

### Obtener Mensajes de un Agente Específico con Sentimiento Positivo

**Solicitud**:

```
GET /sentimientos?agent_name=Juan&sentiment=positivo
```

**Respuesta**:

```json
[
  {
    "conn_id": "12345",
    "agent_name": "Juan",
    "customer_name": "Maria",
    "channel": "Chat",
    "de": "Juan",
    "from_name": "Juan",
    "to_name": "Maria",
    "date": "2024-04-25T10:30:00",
    "message": "¡Gracias por tu ayuda! Muy satisfecho con el servicio.",
    "sentiment": "positivo",
    "sentiment_score": 0.85
  },
  ...
]
```

### Obtener Resumen de Sentimientos en un Rango de Fechas

**Solicitud**:

```
GET /sentimientos/resumen?date_from=2024-01-01&date_to=2024-12-31
```

**Respuesta**:

```json
{
  "total_messages": 1000,
  "positive": 600,
  "neutral": 300,
  "negative": 100
}
```

## Notas Adicionales

- **Gestión de Conexiones a la Base de Datos**: Actualmente, cada solicitud abre una nueva conexión a la base de datos. Para mejorar el rendimiento, se recomienda implementar un pool de conexiones o utilizar un ORM como SQLAlchemy.
- **Seguridad**: Asegúrate de manejar las credenciales de la base de datos de manera segura, preferiblemente utilizando variables de entorno o servicios de gestión de secretos.
- **Escalabilidad**: Si el volumen de datos es grande, considera preprocesar el análisis de sentimiento y almacenarlo directamente en la base de datos para reducir el tiempo de respuesta de la API.
- **Mejoras Futuras**:
  - Implementar autenticación y autorización para proteger los endpoints.
  - Agregar más análisis de datos y métricas avanzadas.
  - Integrar modelos de análisis de sentimiento más avanzados o personalizados.

## Contribuciones

¡Las contribuciones son bienvenidas! Si deseas mejorar este proyecto, por favor sigue los siguientes pasos:

1. **Fork** del repositorio.
2. **Crear una rama** para tu característica o mejora: `git checkout -b feature/nueva-caracteristica`.
3. **Commit** de tus cambios: `git commit -m 'Agregar nueva característica'`.
4. **Push** a la rama: `git push origin feature/nueva-caracteristica`.
5. **Abrir un Pull Request**.

## Licencia

Este proyecto está licenciado bajo la Licencia MIT. Consulta el archivo [LICENSE](LICENSE) para más detalles.

---