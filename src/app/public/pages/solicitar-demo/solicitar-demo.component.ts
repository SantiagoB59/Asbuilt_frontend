import { Component } from '@angular/core';

@Component({
  selector: 'app-solicitar-demo',
  templateUrl: './solicitar-demo.component.html',
  styleUrls: ['./solicitar-demo.component.scss']
})
export class SolicitarDemoComponent {

  enviando = false;

  formulario = {
    nombre: '',
    empresa: '',
    cargo: '',
    email: '',
    telefono: '',
    mensaje: ''
  };

  enviarSolicitud(): void {

    if (this.enviando) {
      return;
    }

    if (
      !this.formulario.nombre ||
      !this.formulario.empresa ||
      !this.formulario.email ||
      !this.formulario.telefono
    ) {
      console.warn('Faltan campos obligatorios.');
      return;
    }

    this.enviando = true;

    console.log('SOLICITUD DE DEMOSTRACIÓN');
    console.log(this.formulario);

    // Aquí posteriormente conectamos el formulario
    // con el backend de IntelliFeet.

    setTimeout(() => {
      this.enviando = false;
    }, 1000);
  }
}