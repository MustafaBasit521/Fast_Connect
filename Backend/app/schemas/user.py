from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional
# the User class is used to represent a user object in the application, 
# while the UserSignUp class is used to validate user input during the sign-up process. 
# The UserSignUp class includes additional validation rules for the name, email, and
#  password fields.
class UserOut(BaseModel):
    id: str
    name: str
    email: EmailStr
    bio: Optional[str] = None
    phone: Optional[str] = None
    role: str = "user"
    status: str = "active"

class UserSignUp(BaseModel):
    name:str=Field(...,min_length=3,description='Enter your name')
    email:EmailStr=Field(...,description='Enter your email address')
    password:str=Field(...,min_length=8,description='Enter your password')
    bio:Optional[str]=Field(None,description='Enter your bio')
    phone:Optional[str]=Field(None,description='Enter your phone number')

    @field_validator("email")
    @classmethod
    def validate_university_email(cls, value):
        if not value.endswith("@lhr.nu.edu.pk"):
            raise ValueError("Email must be a valid FAST Lahore campus email ")
        return value

class UserLogin(BaseModel):
    email:EmailStr=Field(...,description='Enter your email address')
    password:str=Field(...,min_length=8,description='Enter your password')

class ChangePassword(BaseModel):
    old_password:str =Field(...,min_length=8)
    new_password:str =Field(...,min_length=8)

class ForgotPassword(BaseModel):
    email:EmailStr

class ResetPassword(BaseModel):
    token:str
    new_password:str=Field(...,min_length=8)

class ProfileUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=3)
    bio: Optional[str] = None
    phone: Optional[str] = None




