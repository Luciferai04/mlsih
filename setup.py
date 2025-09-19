"""
Setup script for NATPAC Travel Survey App
Smart India Hackathon 2025
"""

from setuptools import setup, find_packages

with open("README.md", "r", encoding="utf-8") as fh:
    long_description = fh.read()

setup(
    name="natpac-travel-survey",
    version="1.0.0",
    author="Soumyajit Ghosh",
    author_email="your.email@example.com",
    description="AI-Powered Comprehensive Travel Survey Solution for Kerala - SIH 2025",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/Luciferai04/mlsih",
    packages=find_packages(exclude=["tests", "*.tests", "*.tests.*", "tests.*"]),
    classifiers=[
        "Development Status :: 5 - Production/Stable",
        "Intended Audience :: Developers",
        "Topic :: Software Development :: Libraries :: Python Modules",
        "License :: OSI Approved :: MIT License",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
        "Operating System :: OS Independent",
    ],
    python_requires=">=3.8",
    install_requires=[
        # Core dependencies
        "numpy>=1.24.0",
        "pandas>=2.0.0",
        "scipy>=1.11.0",
        
        # Machine Learning
        "tensorflow>=2.13.0",
        "scikit-learn>=1.3.0",
        "xgboost>=1.7.0",
        
        # GPS & Location
        "geopy>=2.3.0",
        "haversine>=2.8.0",
        "folium>=0.14.0",
        
        # API Framework
        "fastapi>=0.100.0",
        "uvicorn>=0.23.0",
        
        # Database
        "pymongo>=4.4.0",
        "sqlalchemy>=2.0.0",
        
        # Utilities
        "python-dotenv>=1.0.0",
        "requests>=2.31.0",
        "pydantic>=2.0.0",
    ],
    extras_require={
        "dev": [
            "pytest>=7.4.0",
            "pytest-cov>=4.1.0",
            "black>=23.7.0",
            "flake8>=6.0.0",
            "mypy>=1.4.0",
        ],
        "ml": [
            "torch>=2.0.0",
            "transformers>=4.31.0",
            "lightgbm>=4.0.0",
            "optuna>=3.2.0",
        ],
        "kerala": [
            "indic-nlp-library>=0.91",
            "pymalayalam>=0.2",
        ],
        "visualization": [
            "matplotlib>=3.7.0",
            "seaborn>=0.12.0",
            "plotly>=5.15.0",
        ],
    },
    entry_points={
        "console_scripts": [
            "natpac-server=src.server:main",
            "natpac-ml=services.mlService:main",
        ],
    },
    include_package_data=True,
    zip_safe=False,
)