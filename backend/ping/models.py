from mongoengine import Document
from mongoengine import StringField


class PingData(Document):
    status = StringField(required=True)

    meta = {'collection': 'pingData'}
