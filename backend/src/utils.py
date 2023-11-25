def all_fields_are_none(object):
    """Check if all attributes of an object are None."""
    return all([value is None for value in object.__dict__.values()])