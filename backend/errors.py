class SameValueError(ValueError):
    def __init__(self, value: str):
        self.value = value


class MatchAlreadyConfirmedError(Exception):
    pass


