FROM python:3-alpine3.11
WORKDIR /app
ENV FLASK_APP=app.py
COPY .. /app
RUN pip install -r requirements.txt
EXPOSE 5000
CMD ["flask", "run", "--host=0.0.0.0"]