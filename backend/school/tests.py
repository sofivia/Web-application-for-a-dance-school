from rest_framework import status
from rest_framework.test import APITestCase, APIClient
from django.urls import reverse
from django.contrib.auth import get_user_model
from .models import Instructor, ClassType, ClassGroup, Location, Weekday
from .serializers import ClassGroupReadSerializer
from accounts.models import Role
import datetime


User = get_user_model()


class StudentViewTest(APITestCase):
    @classmethod
    def setUpTestData(cls):
        registerurl = reverse("accounts_register")
        cls.credentails = {"email": 'dario@gmail.com', "password": 'poziomka'}
        client = APIClient()
        client.post(registerurl, cls.credentails, format='json')
        cls.url = reverse("school:students")
        cls.account = User.objects.get(email='dario@gmail.com')
        cls.data = {"first_name": "Dariusz", "last_name": "Kulczyk",
                    "date_of_birth": "2002-10-10", "phone": "0900"}

    def test_get_no_student(self):
        self.client.login(**self.credentails)

        postresponse = self.client.get(self.url)
        self.assertEqual(postresponse.status_code, status.HTTP_404_NOT_FOUND)

    def test_create_student_success(self):
        self.client.login(**self.credentails)

        postresponse = self.client.post(self.url, self.data, format='json')
        self.assertEqual(postresponse.status_code, status.HTTP_201_CREATED)

        getresponse = self.client.get(self.url)
        self.assertEqual(getresponse.status_code, status.HTTP_200_OK)

        getresponse.data.pop("id")
        self.assertEqual(self.data, getresponse.data)

    def test_create_student_not_logged_in(self):
        response = self.client.post(self.url, self.data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_duplicate(self):
        self.client.login(**self.credentails)

        self.client.post(self.url, self.data, format='json')
        response = self.client.post(self.url, self.data, format='json')
        self.assertEqual(response.status_code, status.HTTP_409_CONFLICT)

    def test_put(self):
        self.client.login(**self.credentails)

        self.client.post(self.url, self.data, format='json')

        self.data["first_name"] = "Jan"
        postresponse = self.client.put(self.url, self.data, format='json')
        self.assertEqual(postresponse.status_code, status.HTTP_200_OK)

        getresponse = self.client.get(self.url)
        self.assertEqual(getresponse.status_code, status.HTTP_200_OK)

        getresponse.data.pop("id")
        self.assertEqual(self.data, getresponse.data)

    def test_patch(self):
        self.client.login(**self.credentails)

        self.client.post(self.url, self.data, format='json')

        data = {"first_name": "Jan"}
        postresponse = self.client.patch(self.url, data, format='json')
        self.assertEqual(postresponse.status_code, status.HTTP_200_OK)

        getresponse = self.client.get(self.url)
        self.assertEqual(getresponse.status_code, status.HTTP_200_OK)

        self.data["first_name"] = "Jan"
        getresponse.data.pop("id")
        self.assertEqual(self.data, getresponse.data)


class ClassGroupViewStudentTest(APITestCase):
    @classmethod
    def setUpTestData(cls):
        registerurl = reverse("accounts_register")
        cls.scredentails = {"email": 'dario@gmail.com', "password": 'poziomka'}
        cls.icredentails = {"email": 'stryj@gmail.com', "password": 'pieczara'}
        cls.acredentails = {"email": 'admin@gmail.com', "password": 'hustawka'}
        client = APIClient()
        client.post(registerurl, cls.scredentails, format='json')
        client.post(registerurl, cls.icredentails, format='json')
        client.post(registerurl, cls.acredentails, format='json')

        studenturl = reverse("school:students")
        studentdata = {"first_name": "Dariusz", "last_name": "Kulczyk",
                       "date_of_birth": "2002-10-10", "phone": "0900"}
        client.login(**cls.scredentails)
        client.post(studenturl, studentdata, format='json')

        student_role = Role.objects.get(code="student")
        instructor_role = Role.objects.get(code="instructor")
        cls.instructor = User.objects.get(email="stryj@gmail.com")
        cls.instructor.roles.add(instructor_role)
        cls.instructor.roles.remove(student_role)

        instructorurl = reverse("school:instructors")
        instructordata = {"first_name": "Stryj", "last_name": "Baggins",
                          "short_bio": "Stepuję.", "phone": "1000"}
        client.login(**cls.icredentails)
        client.post(instructorurl, instructordata, format='json')

        admin_role = Role.objects.get(code="admin")
        admin = User.objects.get(email="admin@gmail.com")
        admin.roles.add(admin_role)
        admin.roles.remove(student_role)

        cls.location = Location.objects.create(name="Sala mała")
        cls.classtype = ClassType.objects.create(name="Broadway Jazz")
        cls.instructor = Instructor.objects.all()[0]

    def test_get(self):
        self.client.login(**self.scredentails)

        cgroup = ClassGroup.objects.create(
            name="środowa", class_type=self.classtype,
            primary_instructor=self.instructor,
            weekday=Weekday.WEDNESDAY, location=self.location,
            start_time=datetime.time(14, 30), end_time=datetime.time(15, 30))
        url = reverse("school:classgroup-detail", kwargs={"pk": cgroup.id})

        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        exp = ClassGroupReadSerializer(cgroup).data
        self.assertEqual(response.data, exp)

    def test_get404(self):
        self.client.login(**self.scredentails)
        url = reverse("school:classgroup-detail", kwargs={"pk": 1})

        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_get_list_empty(self):
        self.client.login(**self.scredentails)

        url = reverse("school:classgroup-list")

        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.assertEqual(response.data, [])

    def test_get_list(self):
        self.client.login(**self.scredentails)

        cgroup = ClassGroup.objects.create(
            name="środowa", class_type=self.classtype,
            primary_instructor=self.instructor,
            weekday=Weekday.WEDNESDAY, location=self.location,
            start_time=datetime.time(14, 30), end_time=datetime.time(15, 30))
        url = reverse("school:classgroup-list")

        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        exp = ClassGroupReadSerializer(cgroup).data
        self.assertEqual(response.data, [exp])

    def test_post(self):
        self.client.login(**self.acredentails)
        url = reverse("school:classgroup-list")

        data = {
            'name': 'środowa',
            'class_type': self.classtype.pk,
            'primary_instructor': self.instructor.id,
            'weekday': 3,
            'start_time': '14:30:00',
            'end_time': '15:30:00',
            'location': self.location.pk,
            'capacity': 12,
            'start_date': '2025-02-01',
            'end_date': '2025-06-30'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        del data["class_type"]
        data["primary_instructor"] = "Stryj Baggins"
        data["location"] = "Sala mała"

        pk = ClassGroup.objects.all()[0].pk
        url = reverse("school:classgroup-detail", kwargs={"pk": pk})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        response.data.pop("pk")
        self.assertEqual(response.data, data)