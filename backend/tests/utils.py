import string
import random


def get_random_string(length: int, hex: bool = False):
    letters = string.ascii_lowercase if not hex else string.hexdigits
    return "".join(random.choice(letters) for _ in range(length))
