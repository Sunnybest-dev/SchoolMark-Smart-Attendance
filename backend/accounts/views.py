from django.shortcuts import render

# Create your views here.
@api_view(['POST'])
def register_student(request):
    username = request.data.get('username')
    email = request.data.get('email')
    password = request.data.get('password')

    if not username or not email or not password:
        return Response({"detail": "All fields are required"}, status=400)

    if User.objects.filter(username=username).exists():
        return Response({"detail": "Username already exists"}, status=400)

    if User.objects.filter(email=email).exists():
        return Response({"detail": "Email already exists"}, status=400)

    # Create user
    user = User.objects.create_user(username=username, email=email, password=password)

    # Create StudentProfile linked to user
    StudentProfile.objects.create(user=user)

    return Response({"message": "Registration successful"}, status=201)