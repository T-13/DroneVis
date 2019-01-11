from django.db import models

# Create your models here.


class Mesh(models.Model):

    name = models.CharField(max_length=64, null=False)
    value = models.TextField(null=False)

    def __str__(self):
        return self.name