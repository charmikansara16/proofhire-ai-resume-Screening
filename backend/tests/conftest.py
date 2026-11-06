import pytest
import os
import tempfile
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Use a separate test database file in tempdir
test_db_file = tempfile.NamedTemporaryFile(suffix=".db", delete=False)
test_db_url = f"sqlite:///{test_db_file.name}"

os.environ["DATABASE_URL"] = test_db_url
os.environ["STORAGE_DIR"] = tempfile.mkdtemp()
os.environ["JWT_SECRET"] = "test-secret-key-for-pytest-12345678"

from app.config import settings
from app.database import Base, get_db
from app.main import app

engine = create_engine(test_db_url, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)
    if os.path.exists(test_db_file.name):
        try:
            os.unlink(test_db_file.name)
        except Exception:
            pass

@pytest.fixture
def db_session():
    connection = engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)
    yield session
    session.close()
    transaction.rollback()
    connection.close()

@pytest.fixture
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
