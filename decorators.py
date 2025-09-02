import time
import json
import functools
import sys
import os
import random
import string
import hashlib
import secrets

USERS_FILE = "data.json"
current_user = None

class User:
    def __init__(self, user_id, name, access_right, password_hash=None, salt=None):
        self.id = user_id
        self.name = name
        self.access_right = access_right
        self.password_hash = password_hash
        self.salt = salt

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "access_right": self.access_right,
            "password_hash": self.password_hash,
            "salt": self.salt,
        }

    @staticmethod
    def generate_salt(length: int = 16) -> str:
        return secrets.token_hex(length)

    @staticmethod
    def hash_password(password: str, salt: str) -> str:
        return hashlib.sha256((password + salt).encode("utf-8")).hexdigest()

    def set_password(self, password: str):
        self.salt = self.generate_salt()
        self.password_hash = self.hash_password(password, self.salt)

    def check_password(self, password: str) -> bool:
        return self.password_hash == self.hash_password(password, self.salt)

def logging_before(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        print(f"CALLING {func.__name__}: ARGS={args}, KWARGS={kwargs}")
        return func(*args, **kwargs)
    return wrapper


def logging_after(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        result = func(*args, **kwargs)
        print(f"PROCESSED {func.__name__}: RESULT={result}")
        return result
    return wrapper


def timer(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        start = time.time()
        result = func(*args, **kwargs)
        end = time.time()
        print(f"TIMER LOG: {func.__name__} took {end - start:.6f} seconds")
        return result
    return wrapper


def load_users(filename=USERS_FILE):
    if not os.path.exists(filename):
        return []
    with open(filename, "r", encoding="utf-8") as f:
        raw_users = json.load(f)
        return [
            User(
                user_id=u["id"],
                name=u["name"],
                access_right=u["access_right"],
                password_hash=u.get("password_hash"),
                salt=u.get("salt"),
            )
            for u in raw_users
        ]
    
    
def save_users(users, filename=USERS_FILE):
    with open(filename, "w", encoding="utf-8") as f:
        json.dump([u.to_dict() for u in users], f, indent=4, ensure_ascii=False)

def sign_up(name: str, password: str, access_right="user"):
    users = load_users()

    if any(u.name == name for u in users):
        raise ValueError("User already exists!")

    new_id = max([u.id for u in users], default=0) + 1
    user = User(new_id, name, access_right)
    user.set_password(password)

    users.append(user)
    save_users(users)
    print(f"User {name} created with role {access_right}")


def log_in(name: str, password: str) -> User:
    users = load_users()
    user = next((u for u in users if u.name == name), None)

    if not user or not user.check_password(password):
        raise PermissionError("Wrong user or password!")

    print(f"Logged in as {user.name} ({user.access_right})")
    return user

def access_required(required_role):
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            if not current_user:
                raise PermissionError("No user is logged in!")

            if current_user.access_right != required_role:
                raise PermissionError(
                    f"Access denied! Required role: {required_role}, "
                    f"but you are: {current_user.access_right}"
                )
            return func(*args, **kwargs)
        return wrapper
    return decorator


def sort_result(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        result = func(*args, **kwargs)
        if isinstance(result, list):
            return sorted(result)
        return result
    return wrapper


@logging_before
@logging_after
@timer
def add_numbers(a, b):
    time.sleep(1)
    return a + b


@access_required("admin")
def secret_admin_function():
    return "Access granted: admin"


@sort_result
def get_shuffled_alphabet():
    letters = list(string.ascii_lowercase)
    random.shuffle(letters)
    return letters

if __name__ == "__main__":
    '''
    sign_up('John Doe', '123', 'admin')
    sign_up('Jane Smith', '000', 'user')
    sign_up('Mike Johnson', '123', 'user')
    sign_up('Alice Brown', '123', 'user')
    sign_up('Tom Lee', '123', 'admin')
    sign_up('Emma Davis', '123', 'user')
    sign_up('Chris Wilson', '123', 'user')
    sign_up("Sophia Taylor", '444', "user")
    sign_up("Daniel White", '99',"user")
    sign_up("Olivia Harris", '414',"admin")
    '''
    
    print(add_numbers(3, 7))
    
    try:
        name = input("Enter name: ").strip()
        password = input("Enter password: ").strip()
        current_user = log_in(name, password)
        
        print(add_numbers(5, 6))
        print(secret_admin_function())
        print(get_shuffled_alphabet())
    except Exception as e:
        print(e)
