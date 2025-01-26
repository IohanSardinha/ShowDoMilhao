const sp = SUPABASE();

const questionText = document.getElementById('question-text');
const questionValue = document.getElementById('question-value');
const message = document.getElementById('message');
const answerForm = document.getElementById('answer-form');
const playerId = localStorage.getItem('playerID');
let question_id = -1;

if (!playerId) {
    window.location.replace("./index.html");
}

function setWaitingMode(isWaiting) {
    const body = document.body;
    if (isWaiting) {
        body.classList.add('waiting');
        //message.textContent = "Aguardando nova pergunta...";
    } else {
        body.classList.remove('waiting');
        message.textContent = "";
        try{
            document.querySelector('input[name="answer"]:checked').checked = false;
        }catch(ex){}
    }
}

async function getLatestQuestion() {
    const { data, error } = await sp
        .from('questions')
        .select('*')
        .order('id', { ascending: false })
        .limit(1)
        .single();

    return { data, error };
}

async function checkForExistingAnswer() {
    const { data: existingAnswer, error: checkError } = await sp
        .from('answers')
        .select('*')
        .eq('player_id', playerId)
        .eq('question_id', question_id)
        .single();

    if (checkError && checkError.code !== 'PGRST116') {
        message.textContent = `Error: ${checkError.message}`;
        return null;
    }

    return existingAnswer;
}

async function waitNewQuestion(){
    setWaitingMode(true);
    // Poll for a new question every 5 seconds
    const interval = setInterval(async () => {
        const { data: latestQuestion } = await getLatestQuestion();
        if (latestQuestion && latestQuestion.id !== question_id) {
            clearInterval(interval);
            setWaitingMode(false);
            main(); // Reload the page with the new question
        }
    }, 5000);
}

async function main() {

   const {datap, errp} =  await sp.from("players").select("*").eq("id", playerID).single();
      
   if(!datap)
          window.location.replace("./index.html");
    
    const { data, error } = await getLatestQuestion();

    if (error) {
        if (error.code === "PGRST116") {
            message.textContent = "Nenhuma pergunta registrada.";
            waitNewQuestion();

        } else {
            message.textContent = `Error: ${error.message}`;
        }
        return;
    }

    question_id = data.id;
    questionText.textContent = data.text;
    questionValue.textContent = `Valendo R$ ${data.value}`;

    const existingAnswer = await checkForExistingAnswer();

    if (existingAnswer) {
        message.textContent = "Você já respondeu essa pergunta, espere a próxima.";
        waitNewQuestion();
        return;
    }
}

async function submitAnswer(answer) {
    const existingAnswer = await checkForExistingAnswer();

    if (existingAnswer) {
        message.textContent = "Você já respondeu essa pergunta, espere a próxima.";
        waitNewQuestion();
        return;
    }

    const { data, error } = await sp
        .from('answers')
        .insert([{ player_id: playerId, question_id, answer }]);

    if (error) {
        message.textContent = `Error: ${error.message}`;
    } else {
        message.textContent = "Resposta enviada com sucesso!";
        waitNewQuestion();
    }
}

// Event listener for form submission
answerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const selectedAnswer = document.querySelector('input[name="answer"]:checked');
    if (!selectedAnswer) {
        message.textContent = "Selecione uma resposta antes de enviar.";
        return;
    }

    const answer = parseInt(selectedAnswer.value, 10);
    submitAnswer(answer);
});

// Run the main function to load the question
main();
