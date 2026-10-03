import { AfterViewInit, Component, OnDestroy } from '@angular/core';

interface Project {
  category: string;
  title: string;
  image: string;
  description: string;
  location: string;
  status: string;
  progress: string;
}

@Component({
  selector: 'app-hero',
  templateUrl: './hero.component.html',
  styleUrls: ['./hero.component.scss']
})
export class HeroComponent implements AfterViewInit, OnDestroy {

  currentYear = new Date().getFullYear();

  private observer?: IntersectionObserver;

  /* =====================================================
     PROYECTOS
  ====================================================== */

  projects: Project[] = [
    {
      category: 'INFRAESTRUCTURA VIAL',
      title: 'Intercambio Vial Norte',
      image: 'assets/img/imagen3.jpeg',
      description:
        'Participamos en proyectos donde la coordinación entre infraestructura, transporte y maquinaria es fundamental para mantener el ritmo de ejecución.',
      location: 'Colombia',
      status: 'En ejecución',
      progress: '68%'
    },

    {
      category: 'INFRAESTRUCTURA',
      title: 'Proyecto de Urbanización',
      image: 'assets/img/imagen4.jpeg',
      description:
        'Soluciones orientadas a la gestión eficiente de equipos, recursos y procesos involucrados en proyectos de infraestructura.',
      location: 'Colombia',
      status: 'En ejecución',
      progress: '82%'
    },

    {
      category: 'TRANSPORTE Y MAQUINARIA',
      title: 'Operación de Flota',
      image: 'assets/img/imagen5.jpeg',
      description:
        'Control y seguimiento de operaciones donde la disponibilidad de vehículos y maquinaria resulta clave para garantizar la continuidad del proyecto.',
      location: 'Colombia',
      status: 'Operativo',
      progress: '91%'
    },

    {
      category: 'GESTIÓN DE ACTIVOS',
      title: 'Control Operacional',
      image: 'assets/img/imagen6.jpg',
      description:
        'Implementación de herramientas para mejorar la trazabilidad, mantenimiento y gestión de activos durante la operación.',
      location: 'Colombia',
      status: 'Finalizado',
      progress: '100%'
    }
  ];

  currentProjectIndex = 0;

  private projectInterval?: ReturnType<typeof setInterval>;

  /* =====================================================
     LIFECYCLE
  ====================================================== */

  ngAfterViewInit(): void {

    this.initScrollAnimations();

    this.initSectionObserver();

    this.initScrollProgress();

    this.startProjectCarousel();
  }

  ngOnDestroy(): void {

    this.observer?.disconnect();

    window.removeEventListener(
      'scroll',
      this.handleScroll
    );

    this.stopProjectCarousel();
  }

  /* =====================================================
     CARRUSEL DE PROYECTOS
  ====================================================== */

  private startProjectCarousel(): void {

    this.projectInterval = setInterval(() => {

      this.nextProject();

    }, 6000);

  }

  private stopProjectCarousel(): void {

    if (this.projectInterval) {

      clearInterval(this.projectInterval);

      this.projectInterval = undefined;

    }

  }

  nextProject(): void {

    this.currentProjectIndex =
      (this.currentProjectIndex + 1) %
      this.projects.length;

  }

  previousProject(): void {

    this.currentProjectIndex =
      (this.currentProjectIndex - 1 + this.projects.length) %
      this.projects.length;

  }

  goToProject(index: number): void {

    this.currentProjectIndex = index;

  }

  /* =====================================================
     REVEAL ANIMATIONS
  ====================================================== */

  private initScrollAnimations(): void {

    const elements =
      document.querySelectorAll('.reveal');

    const observer =
      new IntersectionObserver(

        entries => {

          entries.forEach(entry => {

            if (entry.isIntersecting) {

              entry.target.classList.add('visible');

            }

          });

        },

        {
          threshold: 0.12
        }

      );

    elements.forEach(element => {

      observer.observe(element);

    });

  }

  /* =====================================================
     ACTIVE NAVBAR
  ====================================================== */

  private initSectionObserver(): void {

    const sections =
      document.querySelectorAll(
        '.landing-section'
      );

    const navLinks =
      document.querySelectorAll(
        '.nav-link'
      );

    this.observer =
      new IntersectionObserver(

        entries => {

          const visibleSections =
            Array.from(entries)
              .filter(
                entry =>
                  entry.isIntersecting
              );

          if (!visibleSections.length) {
            return;
          }

          const current =
            visibleSections
              .sort(
                (a, b) =>
                  b.intersectionRatio -
                  a.intersectionRatio
              )[0];

          const sectionId =
            current.target.getAttribute(
              'data-section'
            );

          if (!sectionId) {
            return;
          }

          navLinks.forEach(link => {

            const linkSection =
              link.getAttribute(
                'data-section'
              );

            link.classList.toggle(
              'active',
              linkSection === sectionId
            );

          });

        },

        {
          root: null,

          rootMargin:
            '-25% 0px -60% 0px',

          threshold: [
            0,
            0.1,
            0.25,
            0.5
          ]

        }

      );

    sections.forEach(section => {

      this.observer?.observe(section);

    });

  }

  /* =====================================================
     SCROLL PROGRESS
  ====================================================== */

  private initScrollProgress(): void {

    window.addEventListener(
      'scroll',
      this.handleScroll,
      {
        passive: true
      }
    );

    this.handleScroll();

  }

  private handleScroll = (): void => {

    const scrollTop =
      window.scrollY;

    const documentHeight =
      document.documentElement.scrollHeight -
      window.innerHeight;

    if (documentHeight <= 0) {
      return;
    }

    const progress =
      (scrollTop / documentHeight) * 100;

    const progressBar =
      document.querySelector(
        '.scroll-progress-bar'
      ) as HTMLElement | null;

    if (progressBar) {

      progressBar.style.width =
        `${progress}%`;

    }

  };

}