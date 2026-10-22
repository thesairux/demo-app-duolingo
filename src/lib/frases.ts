// Frases cortas de Numi, con humor de números y aptas para niños y niñas de 9 y 10 años.
import { elegir } from './azar';

const FRASES = {
  acierto: [
    '¡Exacto, como una regla bien derecha!',
    '¡Sumaste un acierto!',
    '¡Eso es matemática pura!',
    '¡Respuesta redondita!',
    '¡Ni la calculadora lo hace tan rápido!',
  ],
  combo: ['¡Vas multiplicando tus aciertos!', '¡Racha de aciertos! Crece más rápido que la tabla del 9.', '¡Imparable, como los números: nunca se acaban!'],
  error: [
    'Ups, esa cuenta no cuadró.',
    'Tranqui, hasta los genios borran y corrigen.',
    'Respira: los errores también enseñan.',
    'Casi. Esa la repasamos al final.',
  ],
  fin: ['¡Lección completada! Suma y sigue.', '¡Listo! Tu cerebro hizo ejercicio.', '¡Lo lograste! Eso merece un recreo.'],
  perfecta: ['¡Lección perfecta! Ni una cuenta fuera de lugar.', '¡Cero errores! Eres pura precisión.'],
  sinVidas: ['Se acabaron las vidas por hoy. Vuelven solas con el tiempo.', 'Pausa obligatoria: hasta los mejores toman recreo.'],
  bienvenida: ['¡Hola! Soy Numi. Hoy los números van a ser tus amigos.'],
  rachaEnPeligro: ['¡Tu racha está por apagarse! Una lección y la salvamos.'],
  rachaPerdida: ['Tu racha se cortó, pero hoy volvemos a contar desde 1.'],
  camino: ['¿Seguimos? Te espera la próxima lección.', 'Cada lección suma. ¡Vamos!', '¿Lista o listo para otra ronda de números?'],
};

export type Momento = keyof typeof FRASES;

export function frase(momento: Momento): string {
  return elegir(FRASES[momento]);
}
