require('dotenv').config();
const nodemailer = require('nodemailer'); 

const destinatarios = [ 
  'correomasivo404@gmail.com',
  'burgosgaviriakevinalbeiro@gmail.com',
  'correomasivo404@gmail.com',
  'correomasivo404@gmail.com',
  'correomasivo404@gmail.com',
  'correomasivo404@gmail.com',
  'correomasivo404@gmail.com',
  'correomasivo404@gmail.com',
  'correomasivo404@gmail.com',
  'correomasivo404@gmail.com',
  
];

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {                                           
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const mensaje = {
  from: process.env.EMAIL_USER,          
  subject: 'Correo Masivo ✔', 
  html: '<h2>¡Hola Instructor German Angarita!</h2><p>Este es un correo enviado desde nuestra app en Node.js usando Nodemailer.</p>'
};

async function enviarCorreos() {
  
  const promesas = destinatarios.map(destinatario => {
    return transporter.sendMail({ ...mensaje, to: destinatario });
  });

  const resultados = await Promise.allSettled(promesas);

  resultados.forEach((resultado, i) => {
    if (resultado.status === 'fulfilled') {
      console.log(` Enviado a ${destinatarios[i]}`); 
    } else {
      console.error(` Error con ${destinatarios[i]}:`, resultado.reason);
    }
  });
}

enviarCorreos();
