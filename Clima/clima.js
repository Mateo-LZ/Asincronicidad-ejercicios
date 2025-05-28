// clima.js
const apis = [ //Array con dos objetos cada uno representa una API diferente 
  {
    name: "OpenMeteo",
    url: "https://api.open-meteo.com/v1/forecast?latitude=6.25184&longitude=-75.56359&current_weather=true",
    parse: (data) => { // funcion que transforma los datos de la API en un string
      return `Clima desde Open-Meteo: ${data.current_weather.temperature}°C, Viento ${data.current_weather.windspeed} km/h`;
    }
  },
  {
    name: "Met.no",
    url: "https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=6.25184&lon=-75.56359",
    parse: (data) => {
      const details = data.properties.timeseries[0].data.instant.details;
      return `Clima desde Met.no: ${details.air_temperature}°C, Humedad ${details.relative_humidity}%`;
    }
  }
];

// Ejecutar consulta a todas las APIs, pero mostrar solo la primera que responda
async function obtenerClima() {
  const promesas = apis.map(api => // Creo un Array de promesas para cada API 
    fetch(api.url, {   //hace un fecth a la url de la API
      headers: {
        'User-Agent': 'clima-app/1.0' // Necesario para Met.no
      }
    })
      .then(res => res.json())//convierte la respuesta a Json 
      .then(data => api.parse(data))//procesa los datos con la funcion parse de cada API
      .catch(err => `${api.name} falló: ${err.message}`)// si hay un error dentra al catch
  );

  try {
    const resultado = await Promise.race(promesas);//promise.race basicamente da el resultado de la API la que sea mas rapida
    console.log("Resultado más rápido:");// Await pausa la funcion async hasta que una promesa se cumpla y retorne el valor
    console.log(resultado);
  } catch (err) {
    console.error(" No se pudo obtener el clima:", err);
  }
}

obtenerClima();
