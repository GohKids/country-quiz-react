import { useEffect, useState, useCallback } from "react";
import { Trophy } from "lucide-react";

const QuizNumber = ({ score }: { score: number }) => {
  return (
    <div className="bg-linear-to-l from-g2 to-g1 ml-auto rounded-3xl px-4 py-1 flex items-center">
      <Trophy size={20} className="mr-2 text-white" />
      <div className="font-vietnam-pro font-medium text-lg text-white">{score}/10 Points</div>
    </div>
  );
};

const CircleNumber = ({ number, currentQuestion }: { number: number; currentQuestion: number }) => {
  return (
    <div
      className={`xl:w-10 xl:h-10 w-6 h-6 rounded-full flex justify-center items-center ${
        number <= currentQuestion + 1 ? "bg-linear-to-l from-g2 to-g1 text-white" : "bg-[#343964] text-white"
      }`}
    >
      <span className="font-vietnam-pro font-bold text-sm">{number}</span>
    </div>
  );
};

const QuizResult = ({ score, onPlayAgain }: { score: number; onPlayAgain: () => void }) => {
  return (
    <div className="bg-[#393F6E] rounded-2xl shadow-2xl max-w-[500px] mx-auto p-4">
      <img className="mx-auto mb-6" src="./congrats.png" alt="" />
      <h2 className="text-2xl font-bold mb-4">Congrats! You completed the quiz.</h2>
      <p className="text-lg">You answered {score}/10 correctly.</p>
      <button className="mt-6 mb-10 text-white py-4 px-6 rounded-lg bg-linear-to-l from-g2 to-g1" onClick={onPlayAgain}>
        Play Again
      </button>
    </div>
  );
};

const getRandomItemsProper = <T,>(array: T[], count: number): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, count);
};

const Quiz = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [randomCountries, setRandomCountries] = useState<any[] | null>(null);
  const [quizData, setQuizData] = useState<{ question: string; options: string[]; answer: string }[] | null>(null);
  const [score, setScore] = useState(0);
  const [answersStatus, setAnswersStatus] = useState<(boolean | null)[]>(Array(10).fill(null));
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [timeLeft, setTimeLeft] = useState(3);
  const [isTimerActive, setIsTimerActive] = useState(false);

  const handleAnswerClick = (option: string) => {
    const isCorrect = option === quizData![currentQuestion].answer;

    setSelectedOption(option);
    setShowAnswer(true);
    setIsTimerActive(false); // หยุดเวลา

    // Update answers status
    setAnswersStatus((prev) => {
      const newStatus = [...prev];
      newStatus[currentQuestion] = isCorrect;
      return newStatus;
    });

    // Update score if correct
    if (isCorrect) {
      setScore(score + 1);
    }

    // Move to next question after 2 seconds
    setTimeout(() => {
      if (currentQuestion < 10) {
        setCurrentQuestion(currentQuestion + 1);
        setTimeLeft(3); // รีเซ็ตเวลา
        setIsTimerActive(true); // เริ่มเวลาใหม่
      }
      setSelectedOption(null);
      setShowAnswer(false);
    }, 2000);
  };

  const handleTimeUp = useCallback(() => {
    if (!showAnswer) {
      setShowAnswer(true);
      setIsTimerActive(false);

      // Mark as incorrect when time runs out
      setAnswersStatus((prev) => {
        const newStatus = [...prev];
        newStatus[currentQuestion] = false;
        return newStatus;
      });

      setTimeout(() => {
        if (currentQuestion < 10) {
          setCurrentQuestion(currentQuestion + 1);
          setTimeLeft(3);
          setIsTimerActive(true);
        }
        setSelectedOption(null);
        setShowAnswer(false);
      }, 2000);
    }
  }, [showAnswer, currentQuestion]);

  const handlePlayAgain = () => {
    setCurrentQuestion(0);
    setScore(0);
    setAnswersStatus(Array(10).fill(null));
    setTimeLeft(3);
    setIsTimerActive(true);
  };

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch("https://restcountries.com/v3.1/all?fields=name,flags");
      const data = await response.json();
      const randomCountries = getRandomItemsProper(data, 10);
      // console.log(randomCountries);
      setRandomCountries(randomCountries);
    };
    fetchData();
  }, []);

  // Timer effect
  useEffect(() => {
    let interval: number;

    if (isTimerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isTimerActive, timeLeft, currentQuestion, showAnswer, handleTimeUp]);

  // Start timer when quiz data is ready
  useEffect(() => {
    if (quizData && currentQuestion === 0) {
      setIsTimerActive(true);
    }
  }, [quizData, currentQuestion]);

  useEffect(() => {
    if (randomCountries) {
      const choice: string[] = [];
      const quiz: { question: string; options: string[]; answer: string }[] = [];
      randomCountries.forEach((country) => {
        choice.push(country?.name?.common);
      });
      randomCountries.forEach((country) => {
        const options = getRandomItemsProper(
          choice.filter((name) => name !== country?.name?.common),
          3
        );
        options.push(country?.name?.common);
        quiz.push({
          question: country?.flags?.svg,
          options: options.sort(() => Math.random() - 0.5),
          answer: country?.name?.common,
        });
      });
      // console.log(choice);
      // console.log(quiz);
      setQuizData(quiz);
    }
  }, [randomCountries]);

  return (
    <div className="container">
      <div className={`mb-10 ${currentQuestion < 10 ? "hidden" : ""}`}>
        <QuizResult score={score} onPlayAgain={handlePlayAgain} />
      </div>
      <div className={`xl:max-w-[800px] mx-auto ${currentQuestion < 10 ? "" : "hidden"}`}>
        <div className="flex w-full h-auto justify-center items-center mb-10">
          <h4 className="font-vietnam-pro font-bold !text-2xl text-white">Country Quiz</h4>
          <QuizNumber score={score} />
        </div>
        <div className="bg-[#393F6E] rounded-2xl shadow-2xl">
          <div className="xl:max-w-[70%] mx-auto">
            <div className="flex justify-between p-4">
              {randomCountries?.map((country, index) => (
                <CircleNumber key={country?.name?.common} number={index + 1} currentQuestion={currentQuestion} />
              ))}
            </div>
            <div>
              {quizData && (
                <div className="p-4">
                  {/* Timer Progress Bar */}
                  <div className="mb-6">
                    <div className="w-full bg-gray-600 rounded-full h-3 mb-2">
                      <div
                        className={`h-3 rounded-full transition-all duration-300 ${
                          timeLeft <= 1 ? "bg-red-500" : "bg-gradient-to-r from-green-400 to-blue-500"
                        }`}
                        style={{ width: `${(timeLeft / 3) * 100}%` }}
                      ></div>
                    </div>
                    <div className="text-center">
                      <span className={`text-sm font-medium ${timeLeft <= 1 ? "text-red-400" : "text-gray-300"}`}>
                        {timeLeft} seconds remaining
                      </span>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h5 className="font-vietnam-pro font-bold !text-xl text-white mb-2">
                      Which country does this flag belong to?
                    </h5>
                    <img src={quizData[currentQuestion]?.question} alt="Country Flag" className="w-48 h-32 mx-auto" />
                  </div>
                  <div className="grid xl:grid-cols-2 grid-cols-1 gap-4 gap-x-8">
                    {quizData[currentQuestion]?.options.map((option) => {
                      const isCorrectAnswer = option === quizData[currentQuestion]?.answer;
                      const isSelected = option === selectedOption;

                      let buttonClass =
                        "text-white py-4 px-6 rounded-lg !bg-[#343964] transition-all duration-300 relative hover:bg-linear-to-l hover:from-g2 hover:to-g1";

                      if (showAnswer) {
                        if (isSelected) {
                          buttonClass += " !bg-linear-to-l from-g2 to-g1";
                        }
                      }

                      return (
                        <button
                          key={option}
                          className={buttonClass}
                          onClick={() => !showAnswer && handleAnswerClick(option)}
                          disabled={showAnswer || timeLeft === 0}
                        >
                          <span className="flex items-center justify-center">
                            {option}
                            {showAnswer &&
                              (isCorrectAnswer ? (
                                <img className="ml-2" src="./Check_round_fill.svg" alt="" />
                              ) : isSelected ? (
                                <img className="ml-2" src="./Close_round_fill.svg" alt="" />
                              ) : (
                                ""
                              ))}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Quiz;
