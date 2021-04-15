# Created by trananhdung on 15/04/2021
# -*- coding: utf-8 -*-
from setuptools import setup
from Cython.Build import cythonize

setup(
    ext_modules=cythonize("bot.pyx")
)