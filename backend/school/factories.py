import factory
from factory.django import DjangoModelFactory
from .models import (
    ClassType,
    ClassGroup,
    Enrollment,
    Student,
    Instructor,
    Weekday,
    Location)
from accounts.fixtures import AccountFactory
from accounts.fixtures import RoleFactory
from datetime import datetime, timedelta


class StudentFactory(DjangoModelFactory):
    class Meta:
        model = Student

    account = factory.SubFactory(AccountFactory)

    @factory.post_generation
    def setup_account(self, create, extracted, **kwargs):
        if not create:
            return
        student_role = RoleFactory(code="student", name="Student")
        self.account.roles.add(student_role)

    first_name = factory.Sequence(lambda n: f"Dariusz-{n}")
    last_name = factory.Sequence(lambda n: f"Kulczyk-{n}")


class InstructorFactory(DjangoModelFactory):
    class Meta:
        model = Instructor

    account = factory.SubFactory(AccountFactory)

    @factory.post_generation
    def setup_account(self, create, extracted, **kwargs):
        if not create:
            return
        instructor_role = RoleFactory(code="instructor", name="Instructor")
        self.account.roles.add(instructor_role)

    first_name = factory.Sequence(lambda n: f"Stryj-{n}")
    last_name = factory.Sequence(lambda n: f"Baggins-{n}")


class ClassTypeFactory(DjangoModelFactory):
    class Meta:
        model = ClassType

    name = factory.Sequence(lambda n: f"Type {n}")
    default_capacity = 10


class LocationFactory(DjangoModelFactory):
    class Meta:
        model = Location
    name = factory.Sequence(lambda n: f"Studio-{n}")


class ClassGroupFactory(DjangoModelFactory):
    class Meta:
        model = ClassGroup

    name = factory.Sequence(lambda n: f"Group {n}")
    class_type = factory.SubFactory(ClassTypeFactory)
    primary_instructor = factory.SubFactory(InstructorFactory)

    weekday = factory.Iterator(Weekday.values)
    start_time = factory.Faker("time_object")

    @factory.lazy_attribute
    def end_time(self):
        duration_minutes = self.class_type.duration_minutes
        temp_dt = datetime.combine(datetime.today(), self.start_time)
        end_dt = temp_dt + timedelta(minutes=duration_minutes)
        return end_dt.time()

    location = factory.SubFactory(LocationFactory)

    is_active = True


class EnrollmentFactory(DjangoModelFactory):
    class Meta:
        model = Enrollment

    student = factory.SubFactory(StudentFactory)
    group = factory.SubFactory(ClassGroupFactory)
