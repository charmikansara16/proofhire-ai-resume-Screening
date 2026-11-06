// Sample dataset derived from Kaggle Resume Dataset benchmarks
// Contains candidate profiles across Data Science, Java Development, HR, DevOps, & Web Design

export const KAGGLE_CATEGORIES = [
  "Data Science",
  "HR",
  "Advocate",
  "Arts",
  "Web Designing",
  "Mechanical Engineer",
  "Sales",
  "Health and fitness",
  "Civil Engineer",
  "Java Developer",
  "Business Analyst",
  "SAP Developer",
  "Automation Testing",
  "Electrical Engineering",
  "Operations Manager",
  "Python Developer",
  "DevOps Engineer",
  "Network Security Engineer",
  "PMO",
  "Database",
  "Hadoop",
  "ETL Developer",
  "DotNet Developer",
  "Blockchain",
  "Testing"
];

export const SAMPLE_JOB_DESCRIPTIONS = {
  "Data Science": `Senior Data Scientist / ML Engineer
Requirements:
- 3+ years experience with Python, PyTorch/TensorFlow, Scikit-learn, and SQL.
- Strong background in NLP, Feature Engineering, Large Language Models (LLM), TF-IDF, Word2Vec, and Pandas.
- Experience building predictive models, data visualization (Matplotlib, Seaborn, Tableau), and deploying REST APIs via FastAPI/Flask.
- M.S. or B.S. in Computer Science, Statistics, Data Analytics, or related technical field.`,

  "Java Developer": `Lead Java Enterprise Software Engineer
Requirements:
- 4+ years of hands-on core Java, Spring Boot, Microservices, Hibernate, and RESTful APIs.
- Experience with MySQL, PostgreSQL, Docker, Kubernetes, Kafka, and Maven/Gradle.
- Knowledge of JUnit testing, CI/CD pipelines, Git, and Agile Scrum methodologies.
- Strong object-oriented design patterns and performance optimization.`,

  "HR": `Human Resources & Talent Acquisition Specialist
Requirements:
- 3+ years in HR management, talent recruitment, onboarding, employee relations, and HRIS systems (Workday, BambooHR).
- Strong communication, conflict resolution, payroll processing, labor law compliance, and performance management.
- Ability to analyze workforce metrics, run full-cycle interview pipelines, and manage vendor relations.`,

  "DevOps Engineer": `Cloud DevOps & Site Reliability Engineer
Requirements:
- Experience with AWS/GCP, Kubernetes, Docker, Terraform, Ansible, Jenkins, and Helm.
- Shell scripting, Python, CI/CD automated deployment, Prometheus, and Grafana monitoring.
- Strong knowledge of Linux administration, networking protocols, security compliance, and infrastructure as code (IaC).`,

  "Web Designing": `UI/UX & Frontend Web Designer
Requirements:
- Proficiency in Figma, Adobe XD, HTML5, CSS3, JavaScript (ES6+), React.js, and Tailwind CSS.
- Wireframing, prototyping, design systems, responsive web development, and user research.
- Mobile-first approach, cross-browser compatibility, and accessibility standards (WCAG).`
};

export const SAMPLE_CANDIDATES = [
  {
    id: "cand-01",
    name: "Dr. Aris Thorne",
    photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
    trueCategory: "Data Science",
    experienceYears: 5,
    email: "aris.thorne@example.com",
    location: "San Francisco, CA",
    summary: "Accomplished Data Scientist specializing in Natural Language Processing (NLP), Deep Learning, and predictive modeling. Proven track record of deploying large-scale Machine Learning solutions and automated resume parsing pipelines using Python, PyTorch, Scikit-Learn, and BERT.",
    resumeText: `DR. ARIS THORNE
Email: aris.thorne@example.com | San Francisco, CA

SUMMARY
Innovative Data Scientist with 5 years of industry experience leveraging Python, NLP, PyTorch, and Scikit-Learn to build scalable machine learning architectures. Expert in Natural Language Processing, TF-IDF vectorization, text classification, and predictive analytics.

SKILLS
- Machine Learning: Python, PyTorch, TensorFlow, Scikit-Learn, XGBoost, Random Forest, Naive Bayes
- NLP & Text Mining: NLTK, SpaCy, HuggingFace Transformers, BERT, TF-IDF, Word2Vec, Topic Modeling
- Data & Viz: Pandas, NumPy, Matplotlib, Seaborn, SQL, PostgreSQL, Tableau, Apache Spark
- MLOps & Tools: FastAPI, Docker, Git, MLflow, AWS S3, Jupyter Notebooks

EXPERIENCE
Senior Machine Learning Scientist | TechCore Analytics (2022 - Present)
- Engineered automated document classification system classifying 50,000+ candidate CVs with 94.2% accuracy.
- Fine-tuned transformer models for semantic search and keyword relevance ranking.
- Built real-time recommendation dashboards using FastAPI and React.

Data Scientist | DataPulse Labs (2019 - 2022)
- Formulated predictive models for customer churn resulting in $1.2M annual retention savings.
- Developed end-to-end NLP pipelines for sentiment analysis on multi-language customer reviews.

EDUCATION
Ph.D. in Computer Science (Focus: Artificial Intelligence & NLP) - Stanford University`,
    photoMetrics: {
      hasFace: true,
      lightingScore: 92,
      framingScore: 95,
      sharpnessScore: 90,
      backgroundScore: 88,
      attireScore: 94,
      overallPhotoRating: 92
    }
  },
  {
    id: "cand-02",
    name: "Vikram R. Patel",
    photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80",
    trueCategory: "Java Developer",
    experienceYears: 6,
    email: "vikram.patel@example.com",
    location: "Austin, TX",
    summary: "Senior Java Developer with 6 years of expertise in Spring Boot microservices, high-throughput distributed systems, Kafka, and Docker Kubernetes cloud infrastructure.",
    resumeText: `VIKRAM R. PATEL
Email: vikram.patel@example.com | Austin, TX

SUMMARY
Results-oriented Senior Java Developer with 6+ years building enterprise-grade cloud applications. Specialized in Core Java, Spring Boot, Microservices, REST APIs, PostgreSQL, and Kafka messaging infrastructure.

TECHNICAL SKILLS
- Languages: Java 17, J2EE, SQL, Shell Scripting, Python
- Frameworks: Spring Boot, Spring MVC, Spring Security, Hibernate, JPA, JUnit, Mockito
- Database & Messaging: PostgreSQL, MySQL, Redis, Apache Kafka, RabbitMQ
- Cloud & DevOps: Docker, Kubernetes, Jenkins CI/CD, AWS EC2/S3, Git, Maven

PROFESSIONAL EXPERIENCE
Senior Java Software Engineer | FinTech Solutions Inc. (2021 - Present)
- Architected resilient payment gateway microservices handling 2M daily transactions in Spring Boot.
- Reduced API latency by 35% by implementing Redis caching and connection pool tuning.

Java Backend Developer | Nexus Systems (2018 - 2021)
- Developed RESTful APIs for inventory management using Hibernate and PostgreSQL.
- Participated in Agile sprint planning, code reviews, and automated CI/CD deployment with Jenkins.

EDUCATION
B.S. in Computer Engineering - University of Texas at Austin`,
    photoMetrics: {
      hasFace: true,
      lightingScore: 89,
      framingScore: 91,
      sharpnessScore: 88,
      backgroundScore: 85,
      attireScore: 90,
      overallPhotoRating: 89
    }
  },
  {
    id: "cand-03",
    name: "Elena Rostova",
    photoUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80",
    trueCategory: "HR",
    experienceYears: 4,
    email: "elena.rostova@example.com",
    location: "Chicago, IL",
    summary: "Strategic HR Specialist experienced in tech talent acquisition, employer branding, Workday HRIS administration, labor compliance, and employee engagement programs.",
    resumeText: `ELENA ROSTOVA
Email: elena.rostova@example.com | Chicago, IL

SUMMARY
Dynamic Human Resources & Talent Acquisition Specialist with 4 years of experience scaling engineering and business teams. Proven expertise in talent sourcing, HRIS implementation, employee relations, and compensation management.

CORE COMPETENCIES
- Talent Acquisition: Technical Sourcing, Candidate Assessment, Interviewing, Offer Negotiation
- HR Operations: Workday, BambooHR, Greenhouse ATS, Payroll Processing, Employee Onboarding
- Compliance & Strategy: Labor Law Compliance, Conflict Resolution, Performance Management, Diversity & Inclusion

EXPERIENCE
Talent Acquisition Partner | Global Innovations Corp (2021 - Present)
- Managed full-cycle recruitment for 80+ engineering and product hires across North America.
- Reduced time-to-hire by 22 days while improving 90-day candidate retention to 96%.
- Integrated Greenhouse ATS with Workday HRIS for seamless applicant tracking.

HR Generalist | Apex Consulting (2020 - 2021)
- Administered benefits enrollment, employee onboarding, and performance review cycles for 300+ staff.

EDUCATION
B.A. in Human Resources Management - Northwestern University`,
    photoMetrics: {
      hasFace: true,
      lightingScore: 94,
      framingScore: 96,
      sharpnessScore: 92,
      backgroundScore: 91,
      attireScore: 95,
      overallPhotoRating: 94
    }
  },
  {
    id: "cand-04",
    name: "Marcus Vance",
    photoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80",
    trueCategory: "DevOps Engineer",
    experienceYears: 4,
    email: "marcus.vance@example.com",
    location: "Seattle, WA",
    summary: "DevOps Engineer passionate about Infrastructure as Code (IaC), Kubernetes cluster management, Automated CI/CD, AWS Cloud, and Site Reliability Engineering.",
    resumeText: `MARCUS VANCE
Email: marcus.vance@example.com | Seattle, WA

SUMMARY
Infrastructure & DevOps Engineer with 4 years of experience designing automated CI/CD deployment pipelines, AWS cloud environments, and Kubernetes orchestration systems.

TECHNICAL SKILLS
- Cloud Platforms: AWS (EKS, EC2, S3, IAM, CloudWatch), GCP
- IaC & Automation: Terraform, Ansible, Docker, Kubernetes, Helm
- CI/CD & Monitoring: Jenkins, GitHub Actions, Prometheus, Grafana, ELK Stack
- Scripting: Bash, Python, Go

EXPERIENCE
DevOps Engineer | CloudScale Systems (2021 - Present)
- Automated deployment of multi-region EKS Kubernetes clusters using Terraform and Helm.
- Built zero-downtime CI/CD pipelines in GitHub Actions reducing deployment failures by 60%.

Systems Administrator | NetGrid Tech (2020 - 2021)
- Managed Linux production servers and implemented Grafana monitoring alerts.

EDUCATION
B.S. in Information Technology - University of Washington`,
    photoMetrics: {
      hasFace: true,
      lightingScore: 87,
      framingScore: 89,
      sharpnessScore: 86,
      backgroundScore: 82,
      attireScore: 88,
      overallPhotoRating: 86
    }
  },
  {
    id: "cand-05",
    name: "Sofia Chen",
    photoUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=600&q=80",
    trueCategory: "Web Designing",
    experienceYears: 3,
    email: "sofia.chen@example.com",
    location: "New York, NY",
    summary: "Creative UI/UX & Web Designer crafting intuitive digital experiences with Figma, React, Tailwind CSS, micro-interactions, and responsive design systems.",
    resumeText: `SOFIA CHEN
Email: sofia.chen@example.com | New York, NY

SUMMARY
User-centric UI/UX and Web Designer with 3 years of experience crafting modern, accessible web applications. Proficient in Figma prototyping, HTML5, CSS3, JavaScript, React, and Tailwind CSS.

SKILLS
- Design & Prototyping: Figma, Adobe XD, Photoshop, Wireframing, User Journey Mapping
- Frontend Web Tech: HTML5, CSS3, JavaScript (ES6+), React.js, Tailwind CSS, Framer Motion
- Methodologies: Design Systems, Responsive Layouts, WCAG Accessibility, Usability Testing

EXPERIENCE
UI/UX Web Designer | PixelCraft Studio (2022 - Present)
- Redesigned core SaaS dashboard interface increasing user conversion rate by 28%.
- Developed reusable UI design token library in Figma and translated to Tailwind CSS.

Junior Web Designer | Creative Canvas Agency (2021 - 2022)
- Created responsive landing pages and interactive client prototypes.

EDUCATION
B.F.A. in Interactive Digital Design - Parsons School of Design`,
    photoMetrics: {
      hasFace: true,
      lightingScore: 95,
      framingScore: 94,
      sharpnessScore: 93,
      backgroundScore: 90,
      attireScore: 92,
      overallPhotoRating: 93
    }
  }
];
