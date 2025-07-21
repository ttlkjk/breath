// script.js
const inhaleSlider = document.getElementById('inhaleSlider');
const exhaleSlider = document.getElementById('exhaleSlider');
const inhaleValueSpan = document.getElementById('inhaleValue');
const exhaleValueSpan = document.getElementById('exhaleValue');
const startButton = document.getElementById('startButton');
const stopButton = document.getElementById('stopButton');
const breathingText = document.getElementById('breathingText');
const animationCircle = document.getElementById('animationDiv'); // 원 애니메이션 요소

let breathingInterval; // 호흡 주기를 제어할 변수
let breathingActive = false; // 호흡 운동 활성화 상태

// 슬라이더 값이 변경될 때마다 화면에 표시되는 텍스트 업데이트
inhaleSlider.oninput = () => {
    inhaleValueSpan.textContent = `${inhaleSlider.value}초`;
};
exhaleSlider.oninput = () => {
    exhaleValueSpan.textContent = `${exhaleSlider.value}초`;
};

// 시작 버튼 클릭 시
startButton.onclick = () => {
    if (!breathingActive) {
        breathingActive = true;
        startButton.disabled = true; // 시작 버튼 비활성화
        stopButton.disabled = false;  // 중지 버튼 활성화
        
        // ✨ 시작 버튼 누르면 원이 나타나도록 클래스 추가
        animationCircle.classList.add('show'); 
        
        startBreathingLoop();         // 호흡 루프 시작
    }
};

// 중지 버튼 클릭 시
stopButton.onclick = () => {
    if (breathingActive) {
        breathingActive = false;
        startButton.disabled = false; // 시작 버튼 활성화
        stopButton.disabled = true;   // 중지 버튼 비활성화
        breathingText.textContent = "시작 버튼을 눌러주세요"; // 텍스트 초기화
        animationCircle.textContent = ""; // 애니메이션 텍스트 초기화
        
        // ✨ 중지 버튼 누르면 원이 사라지도록 클래스 제거 및 기본 스타일 초기화
        animationCircle.classList.remove('show');
        animationCircle.style.transform = 'scale(0)'; // 다시 0으로 줄여서 보이지 않게
        animationCircle.style.backgroundColor = '#6c757d'; // 원 색상 초기화 (기본 회색)

        clearTimeout(breathingInterval); // 예약된 다음 호흡 주기 중지
    }
};

// 호흡 운동 루프 함수
function startBreathingLoop() {
    let is_inhaling = true; // 현재 들이쉬기 단계인지 내쉬기 단계인지 구분

    const runCycle = () => {
        if (!breathingActive) { // 중지 버튼이 눌렸으면 함수 종료
            return;
        }

        if (is_inhaling) {
            // 들이쉬기 단계
            breathingText.textContent = "들이쉬세요";
            animationCircle.textContent = "흡"; // 원 안에 '흡' 표시
            // ✨ 들이쉴 때 원 크기를 더 크게 키웁니다 (예: 1.5배)
            animationCircle.style.transform = 'scale(1.5)'; 
            animationCircle.style.backgroundColor = '#28a745'; // 초록색으로 변경

            // 들이쉬기 시간만큼 기다린 후 다음 단계 실행
            breathingInterval = setTimeout(() => {
                is_inhaling = false; // 다음은 내쉬기 단계
                runCycle(); // 다음 단계 실행
            }, parseFloat(inhaleSlider.value) * 1000); // 슬라이더 값을 밀리초로 변환
        } else {
            // 내쉬기 단계
            breathingText.textContent = "내쉬세요";
            animationCircle.textContent = "하"; // 원 안에 '하' 표시
            // ✨ 내쉴 때 원 크기를 더 작게 줄입니다 (예: 0.5배)
            animationCircle.style.transform = 'scale(0.5)'; 
            animationCircle.style.backgroundColor = '#dc3545'; // 빨간색으로 변경

            // 내쉬기 시간만큼 기다린 후 다음 단계 실행
            breathingInterval = setTimeout(() => {
                is_inhaling = true; // 다음은 들이쉬기 단계
                runCycle(); // 다음 단계 실행
            }, parseFloat(exhaleSlider.value) * 1000); // 슬라이더 값을 밀리초로 변환
        }
    };

    runCycle(); // 첫 호흡 주기 시작
}