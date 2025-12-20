from rest_framework import status
from rest_framework.test import APITestCase
from django.urls import reverse
from django.contrib.auth import get_user_model


User = get_user_model()


class StudentViewTest(APITestCase):
    def setUp(self):
        registerurl = reverse("accounts_register")
        self.credentails = {"email": 'dario@gmail.com', "password": 'poziomka'}
        self.client.post(registerurl, self.credentails, format='json')
        self.url = reverse("school:students")
        self.account = User.objects.get(email='dario@gmail.com')
        self.data = {"first_name": "Dariusz", "last_name": "Kulczyk",
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
        self.assertEqual(self.data, getresponse.data)
