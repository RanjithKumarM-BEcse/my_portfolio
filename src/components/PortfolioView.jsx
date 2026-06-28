import React, { useEffect, useState } from 'react';

export default function PortfolioView({ data, isAdmin, onEditClick, onLoginClick, onLogoutClick }) {
  const [activeSection, setActiveSection] = useState('about');

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['about', 'education', 'skills', 'certificates', 'projects', 'experience', 'contact'];
      let current = 'about';
      for (const sectionId of sections) {
        const element = document.getElementById(sectionId);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 160) {
            current = sectionId;
          }
        }
      }
      setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (e, id) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const { about = {}, education = [], skills = [], certificates = [], projects = [], experience = [], contact = {} } = data;

  return (
    <div className="portfolio-wrapper">
      {/* Dynamic Header */}
      <header className="portfolio-header">
        <nav className="portfolio-nav">
          <h1>{about.name || 'Portfolio'}</h1>
          <ul className="portfolio-nav-links">
            <li>
              <a 
                href="#about" 
                className={`portfolio-nav-link ${activeSection === 'about' ? 'active' : ''}`}
                onClick={(e) => handleNavClick(e, 'about')}
              >
                About
              </a>
            </li>
            {education.length > 0 && (
              <li>
                <a 
                  href="#education" 
                  className={`portfolio-nav-link ${activeSection === 'education' ? 'active' : ''}`}
                  onClick={(e) => handleNavClick(e, 'education')}
                >
                  Education
                </a>
              </li>
            )}
            {skills.length > 0 && (
              <li>
                <a 
                  href="#skills" 
                  className={`portfolio-nav-link ${activeSection === 'skills' ? 'active' : ''}`}
                  onClick={(e) => handleNavClick(e, 'skills')}
                >
                  Skills
                </a>
              </li>
            )}
            {certificates.length > 0 && (
              <li>
                <a 
                  href="#certificates" 
                  className={`portfolio-nav-link ${activeSection === 'certificates' ? 'active' : ''}`}
                  onClick={(e) => handleNavClick(e, 'certificates')}
                >
                  Certificates
                </a>
              </li>
            )}
            {projects.length > 0 && (
              <li>
                <a 
                  href="#projects" 
                  className={`portfolio-nav-link ${activeSection === 'projects' ? 'active' : ''}`}
                  onClick={(e) => handleNavClick(e, 'projects')}
                >
                  Projects
                </a>
              </li>
            )}
            {experience.length > 0 && (
              <li>
                <a 
                  href="#experience" 
                  className={`portfolio-nav-link ${activeSection === 'experience' ? 'active' : ''}`}
                  onClick={(e) => handleNavClick(e, 'experience')}
                >
                  Experience
                </a>
              </li>
            )}
            <li>
              <a 
                href="#contact" 
                className={`portfolio-nav-link ${activeSection === 'contact' ? 'active' : ''}`}
                onClick={(e) => handleNavClick(e, 'contact')}
              >
                Contact
              </a>
            </li>
            
            {/* Admin control buttons in header */}
            {isAdmin && (
              <li>
                <button onClick={onEditClick} className="btn-admin-header">
                  <i className="fa-solid fa-pen-to-square"></i> Edit
                </button>
              </li>
            )}
          </ul>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="hero" id="about">
        <div className="hero-content">
          {about.isAvailable && (
            <div className="status-badge">
              <span className="pulse-dot"></span> Available for Internships
            </div>
          )}
          <h2>Hi, I'm <span className="gradient-text">{about.name}</span></h2>
          <p>{about.bio}</p>
          <div className="buttons">
            {about.resumeUrl && (
              <a className="btn btn-primary" href={about.resumeUrl} target="_blank" rel="noreferrer">
                <i className="fa-regular fa-file-pdf"></i> View Resume
              </a>
            )}
          </div>
        </div>
        <div className="hero-image">
          <div className="photo-glow-wrapper">
            <div className="photo">
              <img src={about.photoUrl || "photo.jpg"} alt={about.name} onError={(e) => { e.target.src = "photo.jpg"; }} />
            </div>
          </div>
        </div>
      </section>

      {/* Education Section */}
      {education.length > 0 && (
        <section id="education">
          <h3 className="section-title"><i className="fa-solid fa-graduation-cap"></i> Education</h3>
          <div className="education-timeline">
            {education.map((item) => (
              <div className="card timeline-card" key={item.id}>
                <div className="card-details">
                  <strong>{item.degree}</strong>
                  <span className="institution-name">{item.institution}</span>
                  {item.grade && <span className="grade-badge">{item.grade}</span>}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Skills Section */}
      {skills.length > 0 && (
        <section id="skills">
          <h3 class="section-title"><i class="fa-solid fa-code"></i> Skills</h3>
          <div className="grid skills-grid">
            {skills.map((skillGroup) => (
              <div className="card skill-card" key={skillGroup.id}>
                <div className="skill-header">
                  <strong>{skillGroup.category}</strong>
                </div>
                <div className="skill-tags">
                  {skillGroup.items.map((item, idx) => (
                    <span className="tag" key={idx}>{item}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Certificates Section */}
      {certificates.length > 0 && (
        <section id="certificates">
          <h3 className="section-title"><i className="fa-regular fa-newspaper"></i> Courses & Certifications</h3>
          <div className="certificates-list">
            {certificates.map((cert) => (
              <div className="card certificate-card-row" key={cert.id}>
                <div className="certificate-header">
                  <div className="cert-title-issuer">
                    <strong>{cert.title}</strong>
                    <span className="issuer">{cert.issuer}</span>
                  </div>
                  {cert.date && <span className="certificate-date-badge">{cert.date}</span>}
                </div>
                {cert.description && <p className="certificate-description">{cert.description}</p>}
                {cert.url && (
                  <a href={cert.url} target="_blank" rel="noreferrer" className="btn-cert">
                    View Certificate <i className="fa-solid fa-arrow-up-right-from-square"></i>
                  </a>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Projects Section */}
      {projects.length > 0 && (
        <section id="projects">
          <h3 className="section-title"><i className="fa-solid fa-laptop-code"></i> Projects</h3>
          <div className="grid projects-grid">
            {projects.map((proj) => (
              <div className="card project-card" key={proj.id}>
                <div className="project-header">
                  <strong>{proj.title}</strong>
                  {proj.date && <span className="project-date">{proj.date}</span>}
                </div>
                {proj.tags && proj.tags.length > 0 && (
                  <div className="project-tech-tags">
                    {proj.tags.map((tag, idx) => (
                      <span className="tech-tag" key={idx}>{tag}</span>
                    ))}
                  </div>
                )}
                <p>{proj.description}</p>
                <div className="project-links">
                  {proj.githubUrl && (
                    <a href={proj.githubUrl} target="_blank" rel="noreferrer" className="btn btn-outline-small">
                      <i className="fa-brands fa-github"></i> GitHub Repository
                    </a>
                  )}
                  {proj.liveUrl && (
                    <a href={proj.liveUrl} target="_blank" rel="noreferrer" className="btn btn-primary-small">
                      <i className="fa-solid fa-globe"></i> Try It Out Here
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Experience Section */}
      {experience.length > 0 && (
        <section id="experience">
          <h3 className="section-title"><i className="fa-solid fa-briefcase"></i> Experience</h3>
          <div className="experience-timeline">
            {experience.map((item) => (
              <div className="card timeline-card" key={item.id}>
                <div className="card-details">
                  <div className="experience-header">
                    <strong>{item.role}</strong>
                    {item.date && <span className="experience-date-badge">{item.date}</span>}
                  </div>
                  <p>{item.description}</p>
                  {item.certificateUrl && (
                    <a href={item.certificateUrl} target="_blank" rel="noreferrer" className="btn-cert">
                      View Certificate <i className="fa-solid fa-arrow-up-right-from-square"></i>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Contact Section */}
      <section id="contact">
        <h3 className="section-title"><i className="fa-solid fa-envelope"></i> Contact</h3>
        <div className="grid contact-grid">
          {contact.email && (
            <a href={`mailto:${contact.email}`} className="card contact-card">
              <i className="fa-regular fa-envelope contact-icon"></i>
              <strong>Email</strong>
              <span>{contact.email}</span>
            </a>
          )}
          {contact.phone && (
            <a href={`tel:${contact.phone}`} className="card contact-card">
              <i className="fa-solid fa-phone contact-icon"></i>
              <strong>Phone</strong>
              <span>{contact.phone}</span>
            </a>
          )}
          {contact.linkedin && (
            <a href={`https://www.linkedin.com/in/${contact.linkedin}`} target="_blank" rel="noreferrer" className="card contact-card">
              <i className="fa-brands fa-linkedin-in contact-icon"></i>
              <strong>LinkedIn</strong>
              <span>{contact.linkedin}</span>
            </a>
          )}
          {contact.github && (
            <a href={`https://github.com/${contact.github}`} target="_blank" rel="noreferrer" className="card contact-card">
              <i className="fa-brands fa-github contact-icon"></i>
              <strong>GitHub</strong>
              <span>{contact.github}</span>
            </a>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer>
        <div className="footer-content">
          <p>&copy; {new Date().getFullYear()} {about.name}</p>
          {isAdmin ? (
            <button onClick={onLogoutClick} className="btn-logout-footer">
              <i className="fa-solid fa-right-from-bracket"></i> Sign Out
            </button>
          ) : (
            <button onClick={onLoginClick} className="btn-login-footer" style={{ marginTop: '1rem' }}>
              <i className="fa-solid fa-lock"></i> Admin
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}
