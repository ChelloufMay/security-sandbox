"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
""""
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('/app/backend/accounts', include('backend.accounts.urls')),
    path('/app/backend/demo', include('backend.demo.urls')),
]
"""
# backend/urls.py
from importlib import import_module
from django.contrib import admin
from django.urls import path, include
import sys

def find_include(*module_names):
    """
    Try to import each module_name and return include(module_name) for the first
    importable one. Returns None if none import.
    """
    for name in module_names:
        try:
            import_module(name)
            return include(name)
        except Exception:
            # skip and try next
            pass
    return None

# Try typical app import paths. Adjust order if your project layout differs.
accounts_include = find_include('accounts.urls', 'backend.accounts.urls')
demo_include = find_include('demo.urls', 'backend.demo.urls')

if accounts_include is None:
    raise RuntimeError(
        "Could not find 'accounts.urls' nor 'backend.accounts.urls'. "
        "Check that your accounts app exists and that package __init__.py files are present."
    )

urlpatterns = [
    path('admin/', admin.site.urls),

    # expose accounts endpoints at root -> /register/, /login/, etc.
    path('', accounts_include),
]

# demo endpoints under /demo/ if available
if demo_include:
    urlpatterns.append(path('demo/', demo_include))
