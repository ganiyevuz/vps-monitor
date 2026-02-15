import json
from cryptography.fernet import Fernet
from django.conf import settings


def get_encryption_key() -> bytes:
    """Get encryption key from settings."""
    key = settings.ENCRYPTION_KEY
    if isinstance(key, str):
        key = key.encode()

    # Fernet keys are 44 bytes when base64 encoded
    # If the key is not a valid Fernet key, generate one
    try:
        # Test if it's a valid Fernet key
        Fernet(key)
        return key
    except Exception:
        # If invalid, generate a new key
        return Fernet.generate_key()


def encrypt_credentials(credentials: dict) -> str:
    """Encrypt credentials dictionary to string."""
    key = get_encryption_key()
    f = Fernet(key)
    json_str = json.dumps(credentials)
    encrypted_bytes = f.encrypt(json_str.encode())
    return encrypted_bytes.decode()


def decrypt_credentials(encrypted_str: str) -> dict:
    """Decrypt credentials string to dictionary."""
    key = get_encryption_key()
    f = Fernet(key)
    decrypted_bytes = f.decrypt(encrypted_str.encode())
    return json.loads(decrypted_bytes.decode())
