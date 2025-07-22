// script.js

// 타이머 설정 초기값
let inhaleTime = 2;   // 들이쉬기 시간 2초로 변경
let holdTime = 0;     // 참기 시간 0초로 변경
let exhaleTime = 2;   // 내쉬기 시간 2초로 변경
let prepareTime = 0;  // 준비 시간 0초로 변경

let currentPhase = 0; // 0: 준비, 1: 들이쉬기, 2: 참기, 3: 내쉬기
let remainingTime = 0;
let intervalId;
let isRunning = false;
// let totalCycles = 0; // 이 줄이 삭제되었는지 다시 확인합니다.
let completedCycles = 0;

// DOM 요소 가져오기
const breathingText = document.getElementById('breathingText');
const circle = document.getElementById('circle');
const startButton = document.getElementById('startButton');
const stopButton = document.getElementById('stopButton');

const inhaleTimeDisplay = document.getElementById('inhaleTime');
const holdTimeDisplay = document.getElementById('holdTime');
const exhaleTimeDisplay = document.getElementById('exhaleTime');
const prepareTimeDisplay = document.getElementById('prepareTime');

// 초기값 표시
inhaleTimeDisplay.textContent = inhaleTime;
holdTimeDisplay.textContent = holdTime;
exhaleTimeDisplay.textContent = exhaleTime;
prepareTimeDisplay.textContent = prepareTime;

// -------------------- 진동 기능 추가 --------------------
function vibrateDevice(pattern) {
    // navigator.vibrate가 지원되는지 확인
    if ("vibrate" in navigator) {
        navigator.vibrate(pattern);
    } else {
        console.log("이 기기는 진동 기능을 지원하지 않습니다.");
        // alert("이 기기는 진동 기능을 지원하지 않습니다."); // 테스트용, 실제 사용 시엔 제거
    }
}
// --------------------------------------------------------

// 타이머 값 변경 함수
function changeTime(type, delta) {
    if (isRunning) return; // 실행 중에는 변경 불가

    switch (type) {
        case 'inhale':
            inhaleTime = Math.max(1, inhaleTime + delta);
            inhaleTimeDisplay.textContent = inhaleTime;
            break;
        case 'hold':
            holdTime = Math.max(0, holdTime + delta); // 0 가능
            holdTimeDisplay.textContent = holdTime;
            break;
        case 'exhale':
            exhaleTime = Math.max(1, exhaleTime + delta);
            exhaleTimeDisplay.textContent = exhaleTime;
            break;
        case 'prepare':
            prepareTime = Math.max(0, prepareTime + delta); // 0 가능
            prepareTimeDisplay.textContent = prepareTime;
            break;
    }
}

// 시작 버튼 클릭 이벤트
startButton.addEventListener('click', () => {
    if (isRunning) return;

    isRunning = true;
    startButton.disabled = true;
    stopButton.disabled = false;
    completedCycles = 0; // 주기 초기화
    // totalCycles = document.getElementById('totalCycles').value; // 이 줄이 삭제되었는지 다시 확인합니다.

    // 모든 타이머 박스 및 버튼 비활성화
    document.querySelectorAll('.timer-box button').forEach(btn => btn.disabled = true);
    document.querySelectorAll('.timer-box .time-display').forEach(display => display.style.pointerEvents = 'none');


    startBreathingCycle();
});

// 중지 버튼 클릭 이벤트
stopButton.addEventListener('click', () => {
    stopBreathing();
});

// 호흡 주기 시작
function startBreathingCycle() {
    if (!isRunning) return;

    completedCycles++;
    // if (totalCycles > 0 && completedCycles > totalCycles) { // 이 if 문이 삭제되었는지 다시 확인합니다.
    //     stopBreathing();
    //     breathingText.textContent = "완료!";
    //     return;
    // }

    breathingText.textContent = `주기 ${completedCycles}`; // 텍스트를 `주기 ${completedCycles}`로 변경합니다.
    currentPhase = 0; // 준비 단계부터 시작
    runPhase();
}

// 각 호흡 단계 실행
function runPhase() {
    if (!isRunning) return;

    let phaseDuration = 0;
    let phaseText = "";
    let color = "";
    let scale = 1;

    switch (currentPhase) {
        case 0: // 준비
            phaseDuration = prepareTime;
            phaseText = "준비";
            color = "#6c757d"; // 회색
            scale = 0.8; // 작게 시작
            // 진동 없음
            break;
        case 1: // 들이쉬기
            phaseDuration = inhaleTime;
            phaseText = "들이쉬기";
            color = "#28a745"; // 초록색
            scale = 1.2; // 커짐
            vibrateDevice([100, 50, 100]); // 들이쉬기 진동
            break;
        case 2: // 참기
            phaseDuration = holdTime;
            phaseText = "참기";
            color = "#ffc107"; // 노란색 (경고)
            scale = 1.2; // 유지
            vibrateDevice([300]); // 참기 진동
            break;
        case 3: // 내쉬기
            phaseDuration = exhaleTime;
            phaseText = "내쉬기";
            color = "#dc3545"; // 빨간색
            scale = 0.8; // 작아짐
            vibrateDevice([80, 50, 80, 50, 80]); // 내쉬기 진동
            break;
    }

    remainingTime = phaseDuration;
    updateBreathingDisplay(phaseText, remainingTime, color, scale);

    // 원 표시 클래스 추가 (초기 한 번만)
    if (!circle.classList.contains('show')) {
        circle.classList.add('show');
    }

    clearInterval(intervalId);
    // phaseDuration이 0초일 경우, 즉시 다음 단계로 넘어가도록 처리
    if (phaseDuration === 0) {
        // 남은 시간이 0초일 경우 즉시 다음 단계로 진행 (setTimeout 대신 직접 호출)
        currentPhase++;
        if (currentPhase > 3) {
            startBreathingCycle();
        } else {
            runPhase();
        }
    } else {
        intervalId = setInterval(() => {
            remainingTime--;
            updateBreathingDisplay(phaseText, remainingTime, color, scale);

            if (remainingTime <= 0) {
                clearInterval(intervalId);
                currentPhase++;
                if (currentPhase > 3) {
                    // 한 주기 완료
                    startBreathingCycle(); // 다음 주기 시작
                } else {
                    runPhase(); // 다음 단계 실행
                }
            }
        }, 1000); // 1초마다 업데이트
    }
}

// 호흡 텍스트 및 원 업데이트
function updateBreathingDisplay(text, time, color, scale) {
    breathingText.textContent = `${text} (${time}초)`;
    circle.style.backgroundColor = color;
    circle.style.transform = `scale(${scale})`; // 원 크기 변경 애니메이션
    circle.textContent = time; // 원 안에 남은 시간 표시
}

// 호흡 중지
function stopBreathing() {
    isRunning = false;
    clearInterval(intervalId);
    breathingText.textContent = ""; // 이 부분을 빈 문자열로 변경합니다.
    circle.classList.remove('show'); // 원 숨기기
    startButton.disabled = false;
    stopButton.disabled = true;

    // 모든 타이머 박스 및 버튼 활성화
    document.querySelectorAll('.timer-box button').forEach(btn => btn.disabled = false);
    document.querySelectorAll('.timer-box .time-display').forEach(display => display.style.pointerEvents = 'auto');
}