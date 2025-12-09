const GEMINI_API_KEY = 'AIzaSyCRzgeX_7js8pMDwqmiyPXG-hKZl4bov6w';

// Diccionario médico básico para normalizar términos
const normalizeMedicalTerms = (msg) => {
    let text = msg.toLowerCase();
    text = text.replace(/cefalea/g, 'dolor de cabeza');
    text = text.replace(/migraña/g, 'migraña dolor de cabeza');
    text = text.replace(/emesis/g, 'vomito');
    text = text.replace(/dispepsia|pirosis/g, 'gastritis acidez estomago');
    text = text.replace(/mialgia/g, 'dolor muscular');
    text = text.replace(/artralgia/g, 'dolor articulaciones');
    text = text.replace(/rinorrea/g, 'escurrimiento nasal gripa');
    text = text.replace(/disnea|dispnea/g, 'falta de aire respirar'); // Trigger emergency
    text = text.replace(/epistaxis/g, 'sangrado nasal');
    text = text.replace(/hipertermia/g, 'fiebre calentura');
    text = text.replace(/astenia|adinamia/g, 'cansancio fatiga');
    text = text.replace(/prurito/g, 'picazon alergia');
    text = text.replace(/edema/g, 'hinchazon inflamacion');
    text = text.replace(/dermatitis/g, 'piel erupcion');
    // Términos coloquiales / comunes
    text = text.replace(/pus|materia/g, 'infeccion pus');
    text = text.replace(/panza/g, 'estomago');
    text = text.replace(/chorro|soltura/g, 'diarrea');
    text = text.replace(/agruras/g, 'acidez');
    text = text.replace(/mocos/g, 'escurrimiento nasal');
    text = text.replace(/lagaña/g, 'infeccion ojos');
    text = text.replace(/ando malo|cuerpo cortado/g, 'gripa resfriado');
    text = text.replace(/empacho|aventado/g, 'indigestion estomago');
    text = text.replace(/retortijon/g, 'colico estomacal');
    text = text.replace(/cruda|resaca/g, 'dolor cabeza estomago');
    text = text.replace(/choya/g, 'cabeza');
    text = text.replace(/ardencia|me arde/g, 'irritacion quemadura');
    text = text.replace(/granos|barros/g, 'acne');
    text = text.replace(/nervios|ansiosa/g, 'estres');
    text = text.replace(/no puedo cagar|tapado|estreñido/g, 'estreñimiento');
    text = text.replace(/flujo/g, 'infeccion vaginal');
    text = text.replace(/comezon/g, 'picazon');
    text = text.replace(/supura|mancha|sale liquido/g, 'infeccion pus'); // Supura -> Infection
    return text;
};

const simpleFallbackResponse = (message, products, cart) => {
    // Traducir términos médicos a lenguaje común antes de procesar
    const lowerMsg = normalizeMedicalTerms(message);

    const isChronic = lowerMsg.includes('seguido') || lowerMsg.includes('frecuente') || lowerMsg.includes('siempre') || lowerMsg.includes('diario') || lowerMsg.includes('crónico') || lowerMsg.includes('mucho tiempo');

    // Helper para buscar producto específico en inventario
    const findProduct = (terms) => {
        return products.find(p => terms.some(term => p.name.toLowerCase().includes(term)));
    };

    // ------------------------------------------
    // 0. 🚨 FILTRO DE SEGURIDAD / EMERGENCIAS 🚨
    // ------------------------------------------
    // Updated to catch 'sangra'
    const emergencyRegex = /(sangre|sangra|sangrado|infarto|corazon|respirar|aire|asfixia|desmayo|inconsciente|veneno|intoxicad|convulsion|dolor fuerte|pecho)/;

    if (lowerMsg.match(emergencyRegex)) {
        // Excluir heridas menores (cortadas en la piel)
        const isMinorIssue = lowerMsg.includes('cortada') || lowerMsg.includes('herida') || lowerMsg.includes('raspon') || lowerMsg.includes('barro') || lowerMsg.includes('grano');
        const isSeriousContext = lowerMsg.includes('tos') || lowerMsg.includes('vomit') || lowerMsg.includes('orina') || lowerMsg.includes('pecho') || lowerMsg.includes('falta');

        // Si es serio O si hay sangrado sin contexto claro de herida menor
        if (isSeriousContext || (lowerMsg.match(/(sangre|sangra|sangrado)/) && !isMinorIssue)) {
            return "⚠️ **ALERTA DE SEGURIDAD**: Lo que describes podría indicar una emergencia médica seria. Farmy es un asistente virtual y **no puede diagnosticar** ni tratar casos graves. \n\nPor favor, **acude a urgencias** o contacta a un médico inmediatamente. No te automediques. 🚑";
        }
    }

    // ------------------------------------------
    // 1. INTENCIÓN DE COMPRA / CARRITO
    // ------------------------------------------
    if (lowerMsg === 'si' || lowerMsg.includes('finalizar') || lowerMsg.includes('pagar') || lowerMsg.includes('quiero comprar')) {
        return "¡Excelente! 🛒 Puedes finalizar tu pedido haciendo clic en el ícono del carrito (arriba a la derecha) y luego en 'Proceder al Pago'.";
    }

    // Detectar preguntas sobre el carrito (evitando falsos positivos como "tengo dolor")
    if (lowerMsg.includes('carrito') || lowerMsg.includes('cesta') || (lowerMsg.includes('que') && lowerMsg.includes('llevo') && !lowerMsg.includes('dias') && !lowerMsg.includes('tiempo'))) {
        if (cart.length === 0) return "Tu carrito está vacío por ahora.";
        const items = cart.map(i => `${i.quantity}x ${i.name}`).join(', ');
        return `Actualmente llevas: ${items}. ¿Deseas finalizar la compra?`;
    }

    // ------------------------------------------
    // 2. BASE DE CONOCIMIENTOS DE SALUD (FALLBACK)
    // ------------------------------------------

    // A) ESTÓMAGO (Dolor, Gastritis, Diarrea, Acidez)
    if (lowerMsg.match(/(estomago|estómago|gastritis|acidez|reflujo|diarrea|vomito|vómito|empacho)/)) {
        const med = findProduct(['bismuto', 'pepto', 'sal de uvas', 'riopan', 'melox', 'treda', 'electrolit']);
        const supp = findProduct(['probiot', 'aloe', 'flora', 'fibra']);

        if (lowerMsg.includes('diarrea') || lowerMsg.includes('vomito')) {
            let r = "Para la diarrea es vital hidratarse.";
            if (med) r += ` Te recomiendo **${med.name}** o un suero.`;
            return r;
        }

        if (isChronic) {
            let r = "Si sufres del estómago seguido, te urge proteger tu flora intestinal.";
            if (supp) r += ` Prueba **${supp.name}** ($${supp.price}) como tratamiento preventivo.`;
            return r;
        }
        let r = "Para alivio express del malestar estomacal:";
        if (med) r += ` Nada como **${med.name}** ($${med.price}).`;
        else r += " Un antiácido o sal de uvas te caerá bien.";
        return r;
    }

    // B) DOLOR DE CABEZA / FIEBRE
    if (lowerMsg.match(/(cabeza|migraña|jaqueca|fiebre|calentura|temperatura)/)) {
        const med = findProduct(['aspirina', 'bioelectro', 'ibuprofeno', 'paracetamol', 'tempra', 'sedalmerck']);
        if (isChronic) return "Para dolores de cabeza constantes, cuidado con el estrés. Podrías probar suplementos de Magnesio, pero consulta a tu médico.";
        if (med) return `Para cortar el dolor o la fiebre rápido, te recomiendo **${med.name}** ($${med.price}). Es infalible.`;
        return "El Paracetamol o Ibuprofeno son lo mejor para eso. Hidrátate y descansa.";
    }

    // C) GRIPA / TOS / GARGANTA
    if (lowerMsg.match(/(gripa|tos|resfriado|garganta|escurrimiento|cuerpo cortado)/)) {
        const med = findProduct(['next', 'antigripal', 'tabcin', 'agrifen', 'jarabe', 'miel', 'broxol']);
        const supp = findProduct(['vitamina c', 'zinc', 'equinacea', 'aderogyl', 'redoxon']);

        if (isChronic) {
            let r = "Si te enfermas a cada rato, tus defensas están bajas.";
            if (supp) r += ` Refuérzalas con **${supp.name}** ($${supp.price}) todos los días.`;
            return r;
        }
        if (med) return `Para esa gripa, te recomiendo **${med.name}** ($${med.price}). Tómalo y descansa.`;
        return "Busca un antigripal multisíntomas o un té con miel y limón.";
    }

    // D) DOLOR MUSCULAR / GOLPES / CÓLICOS
    if (lowerMsg.match(/(muscular|golpe|espalda|pierna|dolor|torcedura|inflamacion|colico|cólico|menstrual)/)) {
        if (lowerMsg.includes('colico') || lowerMsg.includes('menstrual')) {
            const fem = findProduct(['buscapina', 'syncol', 'fem']);
            if (fem) return `Para cólicos, lo mejor es **${fem.name}** ($${fem.price}).`;
            return "Un antiespasmódico como Buscapina te ayudará mucho.";
        }

        const gel = findProduct(['diclofenaco', 'voltaren', 'lonol', 'bengue', 'pomada', 'gel']); // Topico
        const oral = findProduct(['flanax', 'naproxeno', 'aspirina']); // Oral

        if (gel) return `Para ese dolor muscular, te recomiendo aplicar **${gel.name}** ($${gel.price}) en la zona afectada.`;
        if (oral) return `Para desinflamar desde dentro, prueba **${oral.name}** ($${oral.price}).`;
        return "Aplica hielo y busca una pomada antiinflamatoria.";
    }

    // E) PIEL / BELLEZA / HERIDAS / ALERGIAS / INFECCIONES
    if (lowerMsg.match(/(piel|cara|bonita|arrugas|grano|acne|herida|cortada|sangre|quemadura|erupcion|sarpullido|roncha|alergia|hongo|infeccion|pus)/)) {

        // 1. SEGURIDAD MÉDICA: Erupciones o Alergias
        if (lowerMsg.match(/(erupcion|sarpullido|roncha|hongo|infeccion|alergia)/)) {
            return "Para problemas de piel como erupciones, alergias o ronchas, mi recomendación más amable y responsable es que **consultes a tu médico de confianza**. 🩺 Podría ser algo que requiera un tratamiento específico y es mejor no aplicar nada sin diagnóstico.";
        }

        // 2. Primeros Auxilios
        if (lowerMsg.match(/(herida|cortada|sangre|quemadura)/)) {
            const cure = findProduct(['alcohol', 'agua oxigenada', 'curita', 'venda', 'merthiolate', 'vitacilina']);
            if (cure) return `Para curar esa herida, no te puede faltar **${cure.name}** ($${cure.price}).`;
            return "Lava bien la herida y aplica un antiséptico.";
        }

        // 3. Cosmética / Belleza
        const beauty = findProduct(['colageno', 'serum', 'crema', 'bloqueador', 'solar']);
        let r = "Para una piel sana, la hidratación y protección solar son clave.";
        if (beauty) r += ` Te sugiero probar **${beauty.name}** ($${beauty.price}) para ver resultados increíbles. ✨`;
        return r;
    }

    // F) BEBÉS
    if (lowerMsg.match(/(bebe|bebé|pañal|rosadura|formula|leche)/)) {
        const baby = findProduct(['pañal', 'huggies', 'kimbies', 'pomada', 'capent', 'bepan']);
        if (baby) return `Para el cuidado de tu bebé, tenemos **${baby.name}** a $${baby.price}. ¿Necesitas alguna etapa en específico?`;
        return "Tenemos todo para tu bebé: pañales, fórmulas y pomadas para rosaduras.";
    }

    // G) ESTRÉS / SUEÑO / ENERGÍA
    if (lowerMsg.match(/(dormir|insomnio|estres|cansado|energia|fatiga|animo)/)) {
        if (lowerMsg.match(/(cansado|energia|fatiga)/)) {
            const vit = findProduct(['bedoyecta', 'complejo b', 'vitamina', 'ensure', 'suplemento']);
            if (vit) return `Si te sientes sin energía, te urge un "levantón". Prueba **${vit.name}** ($${vit.price}).`;
            return "Come bien y prueba un multivitamínico.";
        }
        const relax = findProduct(['melatonina', 'valeriana', 'te', 'pasiflora']);
        if (relax) return `Para dormir como bebé, prueba **${relax.name}** ($${relax.price}) antes de acostarte. 🌙`;
        return "Intenta desconectarte pantallas y tomar un té relajante.";
    }

    // ------------------------------------------
    // 3. BÚSQUEDA GENÉRICA (Por nombre)
    // ------------------------------------------
    const foundProducts = products.filter(p =>
        lowerMsg.includes(p.name.toLowerCase()) ||
        (p.category && lowerMsg.includes(p.category.toLowerCase()))
    );

    if (foundProducts.length > 0) {
        const productNames = foundProducts.slice(0, 3).map(p => `**${p.name}** ($${p.price})`).join(', ');
        return `Encontré esto disponible: ${productNames}.`;
    }

    // 4. SALUDO O ERROR
    if (lowerMsg.includes('hola') || lowerMsg.includes('buenos')) return "¡Hola! Soy Farmy 🤖. Pregúntame sobre síntomas (dolor, gripa, piel) o busca un producto.";

    return "Lo siento, no entendí bien tu consulta. ¿Podrías decirme qué síntoma tienes o qué producto buscas?";
};

export const generateAIResponse = async (userMessage, productContext = [], cartContext = []) => {
    // Si no hay API Key o falla la conexión, usar Fallback
    if (!GEMINI_API_KEY) {
        return simpleFallbackResponse(userMessage, productContext, cartContext);
    }

    try {
        const productListString = productContext.map(p => `- ${p.name} ($${p.price})`).join('\n');

        const cartString = cartContext.length > 0
            ? cartContext.map(i => `- ${i.quantity}x ${i.name}`).join('\n')
            : "Vacío";

        const systemInstruction = `
            Eres Farmy, el asistente virtual de la farmacia "Farmony".
            Tus responsabilidades:
            1. Responder preguntas sobre salud básica.
            2. Ayudar a encontrar productos en nuestro inventario.
            3. Dar información sobre envíos y pagos.
            4. Informar al usuario sobre qué tiene en su carrito si lo pregunta.

            Inventario:
            ${productListString}

            Carrito Actual del Usuario:
            ${cartString}

            Reglas:
            - Si no está en la lista de inventario, di que no lo tenemos.
            - Sé conciso.
        `;

        // INTENTO: Modelo Lite Preview
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite-preview-02-05:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: systemInstruction + "\n\nUsuario: " + userMessage + "\nFarmy:" }]
                }]
            })
        });

        const data = await response.json();

        if (data.error) {
            console.warn("AI Fallback triggered due to:", data.error.message);
            return simpleFallbackResponse(userMessage, productContext, cartContext);
        }

        return data.candidates[0].content.parts[0].text;

    } catch (error) {
        console.error("AI Service Error:", error);
        return simpleFallbackResponse(userMessage, productContext, cartContext);
    }
};
