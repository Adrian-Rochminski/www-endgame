FROM python:3-alpine3.11
ENV FLASK_APP=app.py
COPY .. /app
WORKDIR /app
RUN pip install -r requirements.txt
EXPOSE 5000
CMD ["flask", "run", "--host=0.0.0.0"]