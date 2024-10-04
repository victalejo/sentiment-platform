import base64

def is_base64(s):
    try:
        if isinstance(s, str):
            # Ajuste para manejar cadenas que pueden tener espacios o padding incorrecto
            s_bytes = s.encode('utf-8')
        elif isinstance(s, bytes):
            s_bytes = s
        else:
            return False
        return base64.b64encode(base64.b64decode(s_bytes)) == s_bytes
    except Exception:
        return False
