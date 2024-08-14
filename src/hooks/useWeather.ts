import axios from "axios";
import { z } from "zod";
//import { object, string, number, Output, parse } from "valibot";
import { SearchType } from "../types";
import { useMemo, useState } from "react";

// Type Guard or Assertion
// function isWeatherResponse(weather: unknown): weather is Weather {
//     return (
//         Boolean(weather) &&
//         typeof weather === 'object' &&
//         typeof (weather as Weather).name === 'string' &&
//         typeof (weather as Weather).main.temp === 'number' &&
//         typeof (weather as Weather).main.temp_max === 'number' &&
//         typeof (weather as Weather).main.temp_min === 'number'
//     )
// }

 // Zod
const Weather = z.object({
    name: z.string(),
    main: z.object({
        temp: z.number(),
        temp_max: z.number(),
        temp_min: z.number()
    })
})

export type Weather = z.infer<typeof Weather>;


// // Valibot
// const WeatherSchema = object({
//     name: string(),
//     main: object({
//         temp: number(),
//         temp_min: number(),
//         temp_max: number()
//     })
// })

// type Weather = Output<typeof WeatherSchema>;

const initialState = {
  name: "",
  main: {
    temp: 0,
    temp_min: 0,
    temp_max: 0,
  },
};

export default function useWeather() {

    const [ weather, setWeather ] = useState<Weather>(initialState);
    const [ loading, setLoading ] = useState(false);
    const [ notFound, setNotFound ] = useState(false);

    const fetchWeather = async (search: SearchType) => {
        const { city, country } = search;
        const apiKey = import.meta.env.VITE_API_KEY;
        setLoading(true);
        setWeather(initialState);
        try {
          const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${city},${country}&appid=${apiKey}`;

          const { data } = await axios(geoUrl);

          if(!data[0]) {
            setNotFound(true);
            return;
          }
          setNotFound(false);
          const { lat, lon } = data[0];

          const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`;

          // Cast type
          //const { data: result } = await axios<Weather>(weatherUrl);
          //console.log(result);

          // const { data: weatherData } =await axios(weatherUrl);
          // const result = isWeatherResponse(weatherData);

          // if(result) {
          //     console.log(weatherData.name);
          // }

          // Zod
            const { data: weatherData } = await axios(weatherUrl);
            const result = Weather.safeParse(weatherData);

            if(result.success) {
                setWeather(result.data);
            } else {
                console.log("Response bad structured");
            }

          // Valibot
        //   const { data: weatherData } = await axios(weatherUrl);
        //   const result = parse(WeatherSchema, weatherData);
        //     if(result) {
        //         console.log(result);
        //     } else {
        //         console.log("Response bad structured");
        //     }

        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }

    const hasWeatherData = useMemo( () => weather.name, [weather]);

    return {
        weather,
        loading,
        notFound,
        fetchWeather,
        hasWeatherData,
    }
}