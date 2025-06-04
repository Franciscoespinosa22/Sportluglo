// Manejo del formulario de contacto
function handleSubmit(e) {
  e.preventDefault();
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const message = document.getElementById('message').value.trim();

  if(name && email && message) {
    Swal.fire({
      title: '¡Mensaje enviado!',
      text: `Gracias por contactarnos, ${name}. Te responderemos pronto.`,
      icon: 'success',
      confirmButtonColor: '#ff6f00'
    });
    e.target.reset();
  } else {
    Swal.fire({
      title: 'Error',
      text: 'Por favor completa todos los campos',
      icon: 'error',
      confirmButtonColor: '#ff6f00'
    });
  }
}

// Inicialización del calendario
document.addEventListener('DOMContentLoaded', function() {
  const calendarEl = document.getElementById('calendar');
  const appointmentForm = document.getElementById('appointment-form');
  const confirmationMessage = document.getElementById('confirmation-message');
  const confirmationDetails = document.getElementById('confirmation-details');
  const googleCalendarLink = document.getElementById('google-calendar-link');
  
  // Horario del taller (9am a 6pm)
  const businessHours = {
    startTime: '09:00',
    endTime: '18:00',
    daysOfWeek: [1, 2, 3, 4, 5] // Lunes a Viernes
  };

  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    locale: 'es',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    selectable: true,
    selectMirror: true,
    select: function(info) {
      calendar.changeView('timeGridDay', info.start);
    },
    dateClick: function(info) {
      calendar.changeView('timeGridDay', info.date);
    },
    eventClick: function(info) {
      Swal.fire({
        title: info.event.title,
        html: `<p><strong>Cliente:</strong> ${info.event.extendedProps.clientName}</p>
               <p><strong>Servicio:</strong> ${info.event.extendedProps.serviceType}</p>
               <p><strong>Teléfono:</strong> ${info.event.extendedProps.clientPhone}</p>
               <p><strong>Notas:</strong> ${info.event.extendedProps.specialNotes || 'Ninguna'}</p>`,
        icon: 'info',
        confirmButtonColor: '#ff6f00'
      });
    },
    businessHours: businessHours,
    slotMinTime: businessHours.startTime,
    slotMaxTime: businessHours.endTime,
    allDaySlot: false,
    slotDuration: '00:30:00',
    slotLabelInterval: '01:00',
    firstDay: 1,
    hiddenDays: [0, 6],
    nowIndicator: true,
    navLinks: true,
    eventTimeFormat: { 
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    },
    events: [
      {
        title: 'Cita - Mantenimiento',
        start: new Date(new Date().setHours(10, 0, 0)),
        end: new Date(new Date().setHours(11, 0, 0)),
        clientName: 'Cliente Ejemplo',
        serviceType: 'Mantenimiento General',
        clientPhone: '555-123-4567'
      }
    ]
  });

  calendar.render();

  // Manejar el envío del formulario de cita
  appointmentForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const clientName = document.getElementById('client-name').value.trim();
    const clientEmail = document.getElementById('client-email').value.trim();
    const clientPhone = document.getElementById('client-phone').value.trim();
    const serviceType = document.getElementById('service-type').value;
    const appointmentDate = document.getElementById('appointment-date').value;
    const appointmentTime = document.getElementById('appointment-time').value;
    const specialNotes = document.getElementById('special-notes').value.trim();
    
    if (!clientName || !clientEmail || !clientPhone || !serviceType || !appointmentDate || !appointmentTime) {
      Swal.fire({
        title: 'Error',
        text: 'Por favor completa todos los campos requeridos',
        icon: 'error',
        confirmButtonColor: '#ff6f00'
      });
      return;
    }

    const appointmentDateTime = new Date(`${appointmentDate}T${appointmentTime}`);
    const endDateTime = new Date(appointmentDateTime.getTime() + 60 * 60 * 1000);
    
    calendar.addEvent({
      title: `Cita - ${serviceType.substring(0, 15)}...`,
      start: appointmentDateTime,
      end: endDateTime,
      clientName: clientName,
      clientEmail: clientEmail,
      clientPhone: clientPhone,
      serviceType: serviceType,
      specialNotes: specialNotes,
      backgroundColor: '#ff6f00',
      borderColor: '#ff6f00'
    });

    confirmationDetails.innerHTML = `
      <p><strong>Nombre:</strong> ${clientName}</p>
      <p><strong>Servicio:</strong> ${serviceType}</p>
      <p><strong>Fecha:</strong> ${appointmentDate} a las ${appointmentTime}</p>
      <p><strong>Teléfono:</strong> ${clientPhone}</p>
      ${specialNotes ? `<p><strong>Notas:</strong> ${specialNotes}</p>` : ''}
    `;
    
    appointmentForm.style.display = 'none';
    confirmationMessage.style.display = 'block';

    const googleCalendarUrl = generateGoogleCalendarLink(
      `Cita Taller SPORTLUGLO - ${serviceType}`,
      appointmentDateTime,
      endDateTime,
      `Taller de Motos SPORTLUGLO\nServicio: ${serviceType}\nCliente: ${clientName}\nTeléfono: ${clientPhone}\nNotas: ${specialNotes || 'Ninguna'}`,
      'Ubicación del taller'
    );
    
    googleCalendarLink.href = googleCalendarUrl;

    sendConfirmationEmail(clientName, clientEmail, clientPhone, serviceType, appointmentDate, appointmentTime);
  });

  calendar.on('select', function(info) {
    const startDate = info.start;
    const endDate = info.end;
    
    const formattedDate = formatDate(startDate);
    const formattedTime = formatTime(startDate);
    
    document.getElementById('appointment-date').value = formattedDate;
    document.getElementById('appointment-time').value = formattedTime;
  });

  function formatDate(date) {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  function formatTime(date) {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  function generateGoogleCalendarLink(title, startDate, endDate, description, location) {
    const formatGoogleDate = (date) => {
      return date.toISOString().replace(/-|:|\.\d+/g, '');
    };
    
    return `https://www.google.com/calendar/render?action=TEMPLATE` +
           `&text=${encodeURIComponent(title)}` +
           `&dates=${formatGoogleDate(startDate)}/${formatGoogleDate(endDate)}` +
           `&details=${encodeURIComponent(description)}` +
           `&location=${encodeURIComponent(location)}` +
           `&sf=true&output=xml`;
  }

  function sendConfirmationEmail(clientName, clientEmail, clientPhone, serviceType, appointmentDate, appointmentTime) {
    const emailBody = `
      <h2>Confirmación de Cita - Taller de Motos SPORTLUGLO</h2>
      <p>Hola ${clientName},</p>
      <p>Tu cita para el servicio de <strong>${serviceType}</strong> ha sido agendada para el <strong>${appointmentDate}</strong> a las <strong>${appointmentTime}</strong>.</p>
      <p>Por favor llega 10 minutos antes de tu cita programada.</p>
      <p>Si necesitas cancelar o reagendar, contáctanos al teléfono: 555-123-4567</p>
      <p>¡Gracias por confiar en nosotros!</p>
      <p><strong>Equipo SPORTLUGLO</strong></p>
    `;
    
    console.log("Simulando envío de correo a:", clientEmail);
    console.log("Contenido del correo:", emailBody);
    
    // Enviar confirmación por SMS después de enviar el correo
    sendConfirmationSMS(clientName, clientPhone, serviceType, appointmentDate, appointmentTime);
  }

  function sendConfirmationSMS(clientName, clientPhone, serviceType, appointmentDate, appointmentTime) {
    // Crear el mensaje SMS
    const smsBody = `
Hola ${clientName}, confirmamos tu cita en Taller SPORTLUGLO para ${serviceType} el ${appointmentDate} a las ${appointmentTime}. 
Para cambios llama al 555-123-4567. ¡Gracias!
    `.trim();
    
    console.log("Enviando SMS a:", clientPhone);
    console.log("Contenido del SMS:", smsBody);
    
    // En una implementación real, se enviaría el SMS a través de una API como Twilio
    // Este código simula el envío del SMS y muestra una notificación al usuario
    
    // Simulación del envío del SMS (esto sería una llamada API real en producción)
    const smsPromise = new Promise((resolve, reject) => {
      // Simular un tiempo de envío y respuesta del 90% de éxito
      setTimeout(() => {
        const success = Math.random() < 0.9;
        if (success) {
          resolve("SMS enviado correctamente");
        } else {
          reject("Error al enviar el SMS");
        }
      }, 1000);
    });
    
    // Manejar la respuesta del envío del SMS
    smsPromise
      .then(response => {
        console.log("SMS enviado exitosamente:", response);
        
        // Mostrar mensaje de éxito al usuario para ambos métodos de confirmación
        Swal.fire({
          title: '¡Cita Confirmada!',
          html: `
            <p>Hemos enviado un correo de confirmación a <strong>${clientEmail}</strong></p>
            <p>También enviamos un mensaje SMS a <strong>${clientPhone}</strong> con los detalles de tu cita.</p>
          `,
          icon: 'success',
          confirmButtonColor: '#ff6f00'
        });
      })
      .catch(error => {
        console.error("Error al enviar SMS:", error);
        
        // Mostrar mensaje con la información del correo enviado pero indicando el error con el SMS
        Swal.fire({
          title: '¡Cita Confirmada!',
          html: `
            <p>Hemos enviado un correo de confirmación a <strong>${clientEmail}</strong></p>
            <p class="text-warning">No pudimos enviar el SMS de confirmación. Por favor, verifica tu correo electrónico.</p>
          `,
          icon: 'warning',
          confirmButtonColor: '#ff6f00'
        });
      });
  }
});