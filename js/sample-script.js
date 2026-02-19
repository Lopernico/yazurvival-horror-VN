/**
 * SAMPLE SCRIPT
 * Ejemplo de guión con todas las características:
 * - Nodos de diálogo normales
 * - Nodos con choices (opciones)
 * - Nodos con dados
 * - Nodos con monedas
 * - Nodos con input de texto
 */

const sampleScript = {
  start: "inicio",
  nodes: [

    {
      id: "inicio",
      speaker: "Sistema",
      displayName: "Sistema",
      text: "Es 14 de febrero.\n\nEncuentras un sobre rosa encima de tu mesa.",
      choices: [
        { text: "Abrir el sobre", next: "abrir_sobre" },
        { text: "Tirarlo a la basura", next: "fin_basura" }
      ]
    },

    {
      id: "fin_basura",
      speaker: "Sistema",
      displayName: "Sistema",
      text: "Decidiste que no valía la pena leer la carta.\n\nLa tiró a la basura y siguió su vida como si nada hubiera pasado.",
      next: null
    },

    {
      id: "abrir_sobre",
      speaker: "Louie",
      displayName: "Louie",
      text: "Tomas el sobre en tus manos y lees lo que tiene escrito.",
      next: "prueba_dados"
    },
    
    {
      id: "prueba_dados",
      speaker: "Louie",
      displayName: "Louie",
      type: "dice",
      text: "Intentas interpretar lo que dice la carta. La suerte te favorecerá?",
      dice: "d6",
      outcomes: [
        { min: 1, max: 2, next: "resultado_bajo" },
        { min: 3, max: 4, next: "resultado_medio" },
        { min: 5, max: 6, next: "resultado_alto" }
      ]
    },
    
    {
      id: "resultado_bajo",
      speaker: "Sistema",
      displayName: "Sistema",
      text: "Tu interpretación es... confusa. La carta no tiene mucho sentido para ti.",
      next: "prueba_moneda"
    },
    
    {
      id: "resultado_medio",
      speaker: "Sistema",
      displayName: "Sistema",
      text: "Entiendes algo de lo que dice, pero hay partes que se te escapan.",
      next: "prueba_moneda"
    },
    
    {
      id: "resultado_alto",
      speaker: "Sistema",
      displayName: "Sistema",
      text: "¡Comprendo perfectamente lo que dice la carta!",
      next: "prueba_moneda"
    },
    
    {
      id: "prueba_moneda",
      speaker: "Louie",
      displayName: "Louie",
      type: "coin",
      text: "Decides lanzar una moneda para ver si debes continuar leyendo...",
      outcomes: [
        { result: "heads", next: "continuar_leyendo" },
        { result: "tails", next: "parar_ahora" }
      ]
    },
    
    {
      id: "continuar_leyendo",
      speaker: "Louie",
      displayName: "Louie",
      text: "La moneda muestra cara. Decides continuar leyendo.",
      next: "prueba_input"
    },
    
    {
      id: "parar_ahora",
      speaker: "Louie",
      displayName: "Louie",
      text: "La moneda muestra cruz. ¿Quizá sea mejor parar aquí?",
      next: null
    },
    
    {
      id: "prueba_input",
      speaker: "Louie",
      displayName: "Louie",
      type: "input",
      text: "Cuál es tu nombre?",
      placeholder: "Escribe tu nombre aquí...",
      required: true,
      next: "fin_input"
    },
    
    {
      id: "fin_input",
      speaker: "Louie",
      displayName: "Louie",
      text: "Veo que tu nombre es memorable. La carta te llama por tu nombre.",
      next: "leer_sobre"
    },

{
      id: "leer_sobre",
      speaker: "Sistema",
      text: "\"Confesiones de un seguidor anónimo\"",
      next: "abrir_sobre_2"
    },

    {
      id: "abrir_sobre_2",
      speaker: "Sistema",
      text: "Dentro hay una carta dirigida a:\n\nJamileth Montserrat\n (AKA Yazumimoon).",
      choices: [
        { text: "Esa soy yo", next: "intro_carta_1" },
        { text: "No es para mí", next: "fin_espionaje" }
      ]
    },

    {
      id: "fin_espionaje",
      speaker: "Sistema",
      text: "Te das cuenta de que no es correcto espiar el correo de otros.\n\nEsto constituye una ofensa criminal penada con 6 meses a 2 años de prisión y una multa de 100 a 300 días.\n\nDecides dejar la carta en su lugar y seguir con tu vida.",
      next: null
    },


      {
      id: "intro_carta_1",
      speaker: "Carta",
      text: "Te decides por leerla. ignorando las consecuencias que esto pueda traer. Asi empieza: \"Hola Yazu\"",
      next: "leer_intro_1"
    },

    {
      id: "leer_intro_1",
      speaker: "Carta",
      text: "esta carta es para ti.\n\nNo sé si alguna vez la leas,\n espero que si...",
      next: "leer_intro_2"
    },
     {
      id: "leer_intro_2",
      speaker: "Carta",
      text: "*Ese es el final de la introducción, empiezas a leer el cuerpo de la carta*",
      next: "leer_carta_1"
    },
    {
      id: "leer_carta_1",
      speaker: "Carta",
      text: "Es normal sentirte perdido, sentir que no encuentras tu lugar.\n\nNo todos tenemos la suerte de haber encontrado a alguien que nos entienda.\nNo todos podemos compartir lo que nos emociona sin temor a ser juzgados.",
      next: "leer_carta_1b"
    },

    {
      id: "leer_carta_1b",
      speaker: "Carta",
      text: "Y ese miedo a ser juzgado,\na hacer el ridículo por mostrar quién eres en realidad,\ngenera inseguridad, paranoia, ansiedad.\n\nTe hace sentir que, tarde o temprano,\nte vas a convertir en el hazmerreír de tus congéneres.",
      choices: [
        { text: "Seguir leyendo", next: "leer_carta_2" },
        { text: "Dejar de leer", next: "fin_canasta" }
      ]
    },

    {
      id: "fin_canasta",
      speaker: "Sistema",
      text: "\"¿Qué tremenda estupidez es esta?\", te dices.\\n\\nHaces una bola la carta y la lanzas al bote de basura,\\nencestando una canasta que, en el básquetbol profesional,\\nte daría 2 puntos en el último segundo del partido,\\nhaciendo ganar a tu equipo,\\nllevándote a las semifinales estatales\\ny asegurándote una beca para un…",
      next: null
    },

    {
      id: "leer_carta_2",
      speaker: "Carta",
      text: "Después de un tiempo viviendo así,\nes normal volverse tosco.\nAsocial.",
      next: "leer_carta_2b"
    },

    {
      id: "leer_carta_2b",
      speaker: "Carta",
      text: "Tratar cada interacción nueva con distintos grados de escepticismo,\ncomo si todo el mundo viniera con intenciones ocultas\n(o al menos con ganas de juzgarte un poco).",
      next: "leer_carta_2c"
    },

    {
      id: "leer_carta_2c",
      speaker: "Carta",
      text: "Porque una vez que has sido lastimado sin razón aparente,\ndesarrollas un miedo irracional\nque termina volviéndote duro, cerrado,\nmedio decerebrado incluso\n—no por elección, sino por supervivencia.",
      choices: [
        {
          text: "Comprendo perfectamente la prosa de esta obra de ficción y su subtexto",
          next: "leer_carta_3"
        },
        {
          text: "Unga bunga, letras difíciles, yo idiota",
          next: "fin_lianas"
        }
      ]
    },

    {
      id: "fin_lianas",
      speaker: "Sistema",
      text: "Después de comerte la carta y lanzar tu excremento al aire,\nte fuiste balanceandote entre las lianas de la selva.\n\nNunca se te volvió a ver.",
      next: null
    },

    {
      id: "leer_carta_3",
      speaker: "Carta",
      text: "Y entonces, un día,\n",
      next: "leer_carta_33"
    },
     {
      id: "leer_carta_33",
      speaker: "Carta",
      text: "un \"rayo\" cae sobre ti.\n",
      next: "leer_carta_3b"
    },

    {
      id: "leer_carta_3b",
      speaker: "Carta",
      text: "Te electrocuta.\nTe lanza fuera de tu zona de confort con violencia.\nTe obliga a cuestionar muchas cosas que dabas por sentadas.",
      next: "leer_carta_3c"
    },

    {
      id: "leer_carta_3c",
      speaker: "Carta",
      text: "¿No soy el único raro?\n¿Es posible que exista alguien con quien pueda compartir mi rareza\nsin miedo a ser juzgado?\n\n¿Será que aquí puedo ser realmente libre?\n¿Ser feliz?\n¿Ser yo?",
      next: "leer_carta_3d"
    },

    {
      id: "leer_carta_3d",
      speaker: "Carta",
      text: "…¿El \"rayo\" acaba de ladrarme?",
      choices: [
        {
          text: "Debo admitir que esa vez me mamé",
          next: "leer_carta_4"
        },
        {
          text: "¿De qué hablas, loquito? Yo nunca hice eso",
          next: "fin_clinica"
        }
      ]
    },

    {
      id: "fin_clinica",
      speaker: "Sistema",
      text: "Tu YO, tu ELLO y tu SUPERYÓ se separan.\\n\\nTu conciencia se fragmenta hasta que ya no distingues la realidad.\\n\\nTu anexión a una clínica mental se lleva a cabo sin problemas.\\n\\nMientras tu familia se despide por última vez, murmuras:\\n\"Yo soy Yazumimoon y nunca he dicho eso…\"",
      next: null
    },

    {
      id: "leer_carta_4",
      speaker: "Carta",
      text: "Es en ese momento que no solo empiezas a perder tus inseguridades\ny el miedo constante a no ser aceptado,\nsino que también ganas la certeza\nde que no solo puedes ser aceptado con todas tus rarezas…",
      next: "leer_carta_4b"
    },

    {
      id: "leer_carta_4b",
      speaker: "Carta",
      text: "Sino que quizá —y esto es importante—\nni siquiera eres tan raro como pensabas.",
      next: "leer_carta_4c"
    },

    {
      id: "leer_carta_4c",
      speaker: "Carta",
      text: "\"O sea,\nesta chica está ladrándole a su micrófono\ny contando historias sobre gases con olor a Danonino\ny nadie parece querer irse.\"",
      next: "leer_carta_4d"
    },

    {
      id: "leer_carta_4d",
      speaker: "Carta",
      text: "Eso pone muchas cosas en perspectiva.\n\nTe da esperanza.\nEsperanza de ser aceptado,\nsin importar qué tan raro seas.",
      choices: [
        {
          text: "jajaja si soy, ahi les va otro rudigo banda, inhalen hondo para que les entre completo",
          next: "leer_carta_5"
        },
        {
          text: "Ya me cansé de que saquen mis trapos sucios a relucir. Me voy de aquí.",
          next: "fin_chica_pedorra"
        }
      ]
    },

    { id: "fin_chica_pedorra",
         speaker: "Sistema", 
         text: "Con un corazón lleno de odio, tomas la carta y la quemas, con la esperanza de que, al hacerlo tus pecados desaparezcan… pero... no es así.",
          next: "fin_chica_pedorra_2" }, 
          { id: "fin_chica_pedorra_2", 
            speaker: "Sistema", 
            text: "Tus ofensas trascienden la palabra escrita; tu conciencia pesa cada vez más sobre tus hombros, hasta llevarte a la locura y la paranoia.",
             next: "fin_chica_pedorra_3" }, 
             { id: "fin_chica_pedorra_3",
                 speaker: "Sistema", 
                 text: "Poco tiempo después, tras muchos intentos de limpiar tu imagen, descubres que todo esfuerzo por mejorar tu reputación es fútil.",
                  next: "fin_chica_pedorra_4" },
                   { id: "fin_chica_pedorra_4",
                     speaker: "Sistema",
                      text: "Aceptas tu realidad después de negarla por años: \"la chica pedorra\". Así te llaman en la calle, pero a ti no te importa.", 
                      next: "fin_chica_pedorra_5" },
                       { id: "fin_chica_pedorra_5",
                         speaker: "Sistema",
                          text: "Sonríes y sigues adelante…", 
                          next:null },

    {
      id: "leer_carta_5",
      speaker: "Carta",
      text: "Mejor no entro en detalles.\nCreo que ya todos entendimos el punto.",
      next: "leer_carta_5b"
    },
{
  id: "leer_carta_5b",
  speaker: "Carta",
  text: "Yazu es… interesante.\nRara.\nMuy rara, en más de un sentido.",
  next: "leer_carta_5c"
},

{
  id: "leer_carta_5c",
  speaker: "Carta",
  text: "Actúa raro, pero no solo actúa raro:\nYazu, como concepto, como idea,\nes rara de encontrar.",
  next: "leer_carta_5d"
},

{
  id: "leer_carta_5d",
  speaker: "Carta",
  text: "Créanme, lo intenté.\nHe visto cosas…\nCosas que no volvería a ver por voluntad propia. (hablo de otros streamers, no pienses mal cochina)",
  next: "leer_carta_5e"
},

{
  id: "leer_carta_5e",
  speaker: "Carta",
  text: "Y mientras más lo piensas,\nmás afortunado te sientes de haberla encontrado,\nde haber entrado justo a ese stream de Twitch,\nen esa hora, ese día, ese momento exacto.",
  next: "leer_carta_5f"
},

{
  id: "leer_carta_5f",
  speaker: "Carta",
  text: "Todos los astros se alinearon\npara que te toparas con esta chica rara\nque va contra cualquier preconcepción\nde lo que una adulta de 23 años se atrevería a hacer\nfrente a un montón de desconocidos.",
  next: "leer_carta_5g"
},


    {
      id: "leer_carta_5g",
      speaker: "Carta",
      text: "Eso sonó mal.\n\nDéjame ponerlo en términos más simples.",
      choices: [
        { text: "Lo dejaré pasar", next: "leer_carta_6" },
        { text: "Ay, cochinote, De que hablas? Estas loquito", next: "fin_pure" }
      ]
    },

 { id: "fin_pure", 
    speaker: "Sistema",
     text: "El momento en que estas palabras abandonan tu boca, algo dentro de ti se retuerce.",
      next: "fin_pure_3" },
       { id: "fin_pure_3",
         speaker: "Sistema",
         text: "El dolor invade cada nervio. Al principio, confundida, caes al suelo hiperventilándote.",
          next: "fin_pure_4" },
           { id: "fin_pure_4",
             speaker: "Sistema",
              text: "Pero lentamente comprendes qué está pasando: este dolor inmenso es el dolor de ser aplastada.",
               next: "fin_pure_5" }, 
               { id: "fin_pure_5", 
                speaker: "Sistema", 
                text: "El peso de tu hipocresía fue demasiado para ti; terminó aplastándote.",
                next: "fin_pure_6" },
                { id: "fin_pure_6", 
                    speaker: "Sistema",
                     text: "Ahora un puré de Yazu yace en el suelo.", 
                     next: "fin_pure_7" }, 
                     { id: "fin_pure_7", 
                        speaker: "Sistema",
                         text: "*Fuiste comprimida por la fuerza de tu cinismo, después de juzgar la misma cosa de la que eres partícipe… ser obscena.*", 
                         next: null 

    

    },{
      id: "leer_carta_6",
      speaker: "Carta",
      text: "Yazumimoon.\n\nGracias por ser rara.\nPor no tener miedo de lo que otros piensan de ti al ser tú misma.",
      next: "leer_carta_6b"
    },

    {
      id: "leer_carta_6b",
      speaker: "Carta",
      text: "Porque no,\nno eres solo una loca con un parlante\ngritando aberraciones\n.",
      next: "leer_carta_6c"
    },

    {
      id: "leer_carta_6c",
      speaker: "Carta",
      text: "También eres amable.\nDivertida.\nY, a veces,\nincluso llego a creer\nque eres más inteligente de lo que dejas ver\n(aunque pase muy, muy rara vez).",
      next: "leer_carta_6d"
    },

    {
      id: "leer_carta_6d",
      speaker: "Carta",
      text: "Eres considerada, atenta,\ny muchas cosas más.\n\nCada seguidor tendrá su propia lista de adjetivos,\npero todos coinciden en algo:",
      choices: [
        { text: "¿En qué coinciden?", next: "final_verdadero_1" },
        {
          text: "todos coinciden en que soy inteligente, hermosa, graciosa, multifacetica, polifacetica, Brillante, Inigualable, perfecta...",
          next: "fin_egolatra"
        }
      ]
    },

    {
  id: "fin_egolatra",
  speaker: "Sistema",
  text: "Mientras seguías tu torrente de cumplidos hacia ti misma, lentamente tu postura cambiaba sin que te dieras cuenta.",
  next: "fin_egolatra_2"
},
{
  id: "fin_egolatra_2",
  speaker: "Sistema",
  text: "Tu espalda se encorvaba, tu cuello se torcía, pero tú seguías con tu dictamen narcisista.",
  next: "fin_egolatra_3"
},
{
  id: "fin_egolatra_3",
  speaker: "Sistema",
  text: "Finalmente llegaste a la cúspide evolutiva de los ególatras como tú.",
  next: "fin_egolatra_4"
},
{
  id: "fin_egolatra_4",
  speaker: "Sistema",
  text: "Habías logrado convertirte en un círculo perfecto.",
  next: "fin_egolatra_5"
},
{
  id: "fin_egolatra_5",
  speaker: "Sistema",
  text: "Has logrado la autofelación perpetua...",
  next: null
},

{
  id: "final_verdadero_1",
  speaker: "Carta",
  text: "Todos aprecian a Jamileth",
  next: "final_verdadero_2"
},
{
  id: "final_verdadero_2",
  speaker: "Carta",
  text: "Exactamente por la persona que es,",
  next: "final_verdadero_3"
},
{
  id: "final_verdadero_3",
  speaker: "Carta",
  text: "Con sus cosas buenas",
  next: "final_verdadero_4"
},
{
  id: "final_verdadero_4",
  speaker: "Carta",
  text: "Y sus cosas malas.",
  next: "final_verdadero_5"
},
{
  id: "final_verdadero_5",
  speaker: "Carta",
  text: "Pero, sin importar qué...",
  next: "final_verdadero_6"
},
{
  id: "final_verdadero_6",
  speaker: "Carta",
  text: "Te aprecian por ser TÚ.",
  next: "final_verdadero_7"
},
{
  id: "final_verdadero_7",
  speaker: "Carta",
  text: "YAZUMIMOON",
  next: "final_verdadero_8"
},
{
  id: "final_verdadero_8",
  speaker: "Carta",
  text: "Feliz 14 de febrero.",
  next: "final_verdadero"
},
{
  id: "final_verdadero",
  speaker: "Carta",
  text: "GRACIAS POR SER TÚ MISMA.",
  next: null
}

  ]
};
