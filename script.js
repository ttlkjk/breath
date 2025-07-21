// script.js

// 시간 값 저장 객체
const breathingTimes = {
    inhale: 2,
    inhaleHold: 0,
    exhale: 2,
    exhaleHold: 0
};

// HTML 요소 가져오기
const inhaleValueDisplay = document.getElementById('inhaleValue');
const inhaleHoldValueDisplay = document.getElementById('inhaleHoldValue');
const exhaleValueDisplay = document.getElementById('exhaleValue');
const exhaleHoldValueDisplay = document.getElementById('exhaleHoldValue');

const startButton = document.getElementById('startButton');
const stopButton = document.getElementById('stopButton');
const breathingText = document.getElementById('breathingText');
const animationCircle = document.getElementById('animationDiv'); // 원 애니메이션 요소

let breathingInterval; // 호흡 주기를 제어할 변수
let breathingActive = false; // 호흡 운동 활성화 상태
let currentPhase = 0; // 0: 들이쉬기, 1: 들이쉬고 숨참기, 2: 내쉬기, 3: 내쉬고 숨참기

// 초기 시간 표시 업데이트
function updateDisplayTimes() {
    inhaleValueDisplay.textContent = breathingTimes.inhale;
    inhaleHoldValueDisplay.textContent = breathingTimes.inhaleHold;
    exhaleValueDisplay.textContent = breathingTimes.exhale;
    exhaleHoldValueDisplay.textContent = breathingTimes.exhaleHold;
}
updateDisplayTimes(); // 페이지 로드 시 초기 값 표시

// 화살표 버튼 클릭 이벤트 리스너 추가
document.querySelectorAll('.arrow-btn').forEach(button => {
    button.addEventListener('click', (event) => {
        const target = event.target.dataset.target; // 어떤 시간(inhale, exhale 등)을 조절하는지
        const direction = event.target.dataset.direction; // 위로(up)인지 아래로(down)인지

        if (direction === 'up') {
            breathingTimes[target]++;
        } else {
            // 0초 미만으로 내려가지 않도록 설정
            if (breathingTimes[target] > 0) {
                breathingTimes[target]--;
            }
        }
        updateDisplayTimes(); // 변경된 시간 표시 업데이트
    });
});


// 시작 버튼 클릭 시
startButton.onclick = () => {
    if (!breathingActive) {
        breathingActive = true;
        startButton.disabled = true; // 시작 버튼 비활성화
        stopButton.disabled = false;  // 중지 버튼 활성화
        
        animationCircle.classList.add('show'); // 시작 버튼 누르면 원이 나타나도록 클래스 추가
        currentPhase = 0; // 첫 단계부터 시작
        startBreathingLoop();         // 호흡 루프 시작
    }
};

// 중지 버튼 클릭 시
stopButton.onclick = () => {
    if (breathingActive) {
        breathingActive = false;
        startButton.disabled = false; // 시작 버튼 활성화
        stopButton.disabled = true;   // 중지 버튼 비활성화
        breathingText.textContent = ""; // 문구를 지웁니다.
        animationCircle.textContent = ""; // 애니메이션 텍스트 초기화
        
        animationCircle.classList.remove('show'); // 중지 버튼 누르면 원이 사라지도록 클래스 제거
        animationCircle.style.transform = 'scale(0)'; // 다시 0으로 줄여서 보이지 않게
        animationCircle.style.backgroundColor = '#6c757d'; // 원 색상 초기화 (기본 회색)

        clearTimeout(breathingInterval); // 예약된 다음 호흡 주기 중지
    }
};

// 호흡 운동 루프 함수
function startBreathingLoop() {
    if (!breathingActive) { // 중지 버튼이 눌렸으면 함수 종료
        return;
    }

    let duration = 0;
    let nextPhase = 0;

    switch (currentPhase) {
        case 0: // 들이쉬기
            breathingText.textContent = "들이쉬세요";
            animationCircle.textContent = "흡";
            animationCircle.style.transform = 'scale(1.5)'; // 원 크기 키우기
            animationCircle.style.backgroundColor = '#28a745'; // 초록색
            duration = breathingTimes.inhale * 1000;
            nextPhase = 1; // 다음 단계는 들이쉬고 숨참기
            break;
        case 1: // 들이쉬고 숨참기
            breathingText.textContent = "숨 참으세요 (들이쉬고)";
            animationCircle.textContent = "정지";
            animationCircle.style.transform = 'scale(1.5)'; // 들이쉬는 크기 유지
            animationCircle.style.backgroundColor = '#ffc107'; // 노란색
            duration = breathingTimes.inhaleHold * 1000;
            nextPhase = 2; // 다음 단계는 내쉬기
            break;
        case 2: // 내쉬기
            breathingText.textContent = "내쉬세요";
            animationCircle.textContent = "하";
            animationCircle.style.transform = 'scale(0.5)'; // 원 크기 줄이기
            animationCircle.style.backgroundColor = '#dc3545'; // 빨간색
            duration = breathingTimes.exhale * 1000;
            nextPhase = 3; // 다음 단계는 내쉬고 숨참기
            break;
        case 3: // 내쉬고 숨참기
            breathingText.textContent = "숨 참으세요 (내쉬고)";
            animationCircle.textContent = "정지";
            animationCircle.style.transform = 'scale(0.5)'; // 내쉬는 크기 유지
            animationCircle.style.backgroundColor = '#007bff'; // 파란색
            duration = breathingTimes.exhaleHold * 1000;
            nextPhase = 0; // 다음 단계는 다시 들이쉬기 (한 주기 완료)
            break;
    }

    breathingInterval = setTimeout(() => {
        currentPhase = nextPhase; // 다음 단계로 전환
        startBreathingLoop(); // 다음 단계 실행
    }, duration);
}