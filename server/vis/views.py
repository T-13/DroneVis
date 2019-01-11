from django.http import HttpResponse
from django.template import loader
from .models import *

# Create your views here.


def main_view(request):
    template = loader.get_template('main_view/view.html')

    meshes = Mesh.objects.all().values('id', 'name')

    context = {
        "user": request.user,
        "models": meshes,
    }
    return HttpResponse(template.render(context, request))
