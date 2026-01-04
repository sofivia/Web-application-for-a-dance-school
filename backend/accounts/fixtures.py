import factory
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password
from .models import Role

User = get_user_model()
PASSWORD_HASH = make_password('poziomka')


class RoleFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Role
        django_get_or_create = ('code',)

    code = "student"
    name = "Student"


class AccountFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = User

    email = factory.Sequence(lambda n: f"user{n}@gmail.com")
    password = PASSWORD_HASH

    @classmethod
    def _create(cls, model_class, *args, **kwargs):
        manager = cls._get_manager(model_class)
        return manager.create(*args, **kwargs)

    @factory.post_generation
    def roles(self, create, extracted, **kwargs):
        if not create:
            return
        if extracted:
            for role in extracted:
                self.roles.add(role)
