// script.js

// 타이머 설정 초기값
let inhaleTime = 2.0;   // 들이쉬기 시간 (소수점 포함)
let holdTime = 0.0;     // 참기 시간 (소수점 포함)
let exhaleTime = 2.0;   // 내쉬기 시간 (소수점 포함)
let prepareTime = 0.0;  // 준비 시간 (소수점 포함)

let currentPhase = 0; // 0: 준비, 1: 들이쉬기, 2: 참기, 3: 내쉬기
let remainingTime = 0.0; // 남은 시간도 소수점 포함
let intervalId;
let isRunning = false;
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

// 초기값 표시 (소수점 첫째 자리까지 표시)
inhaleTimeDisplay.textContent = inhaleTime.toFixed(1);
holdTimeDisplay.textContent = holdTime.toFixed(1);
exhaleTimeDisplay.textContent = exhaleTime.toFixed(1);
prepareTimeDisplay.textContent = prepareTime.toFixed(1);

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
    // isRunning 상태와 관계없이 시간 조절 가능
    const step = 0.5; // 0.5초 단위로 조절
    let newTime;

    switch (type) {
        case 'inhale':
            newTime = inhaleTime + (delta * step);
            inhaleTime = Math.max(0.5, Math.round(newTime * 10) / 10); // 최소 0.5초, 소수점 오류 방지
            inhaleTimeDisplay.textContent = inhaleTime.toFixed(1);
            break;
        case 'hold':
            newTime = holdTime + (delta * step);
            holdTime = Math.max(0, Math.round(newTime * 10) / 10); // 최소 0초, 소수점 오류 방지
            holdTimeDisplay.textContent = holdTime.toFixed(1);
            break;
        case 'exhale':
            newTime = exhaleTime + (delta * step);
            exhaleTime = Math.max(0.5, Math.round(newTime * 10) / 10); // 최소 0.5초, 소수점 오류 방지
            exhaleTimeDisplay.textContent = exhaleTime.toFixed(1);
            break;
        case 'prepare':
            newTime = prepareTime + (delta * step);
            prepareTime = Math.max(0, Math.round(newTime * 10) / 10); // 최소 0초, 소수점 오류 방지
            prepareTimeDisplay.textContent = prepareTime.toFixed(1);
            break;
    }

    // 만약 현재 진행 중인 단계의 시간이 변경되었다면,
    // 다음 setInterval 루프에서 변경된 시간을 반영하도록 remainingTime을 다시 계산할 필요는 없습니다.
    // 왜냐하면 runPhase()가 호출될 때마다 phaseDuration을 해당 변수에서 다시 가져오기 때문입니다.
    // 즉, 현재 단계가 끝나고 다음 단계로 넘어갈 때 변경된 시간이 적용됩니다.
    // 현재 단계에서 실시간으로 시간이 줄어드는 속도를 바꾸고 싶다면,
    // clearInterval 후 새 setInterval을 즉시 설정해야 하지만,
    // 이는 UI 깜빡임을 유발할 수 있어 사용자 경험에 좋지 않을 수 있습니다.
    // 현재 방식(다음 단계에 반영)이 더 일반적이고 부드러운 구현입니다.
}

// 시작 버튼 클릭 이벤트
startButton.addEventListener('click', () => {
    if (isRunning) return;

    isRunning = true;
    startButton.disabled = true;
    stopButton.disabled = false;
    completedCycles = 0; // 주기 초기화 (새로운 시작이므로)

    // 타이머 박스 및 버튼은 이제 항상 활성화됩니다.
    // document.querySelectorAll('.timer-box button').forEach(btn => btn.disabled = true);
    // document.querySelectorAll('.timer-box .time-display').forEach(display => display.style.pointerEvents = 'none');


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
    breathingText.textContent = `주기 ${completedCycles}`;
    currentPhase = 0; // 준비 단계부터 시작
    runPhase();
}

// 각 호흡 단계 실행
function runPhase() {
    if (!isRunning) return;

    let phaseDuration = 0.0; // 소수점 포함
    let phaseText = "";
    let color = "";
    let scale = 1; // 이 값은 updateBreathingDisplay로 전달되어 실제 스케일 조정에 사용됨.

    switch (currentPhase) {
        case 0: // 준비
            phaseDuration = prepareTime; // 현재 prepareTime 변수 값 참조
            phaseText = "준비";
            color = "#6c757d"; // 회색
            scale = 0.6; // 더 작게 시작
            // 진동 없음
            break;
        case 1: // 들이쉬기
            phaseDuration = inhaleTime; // 현재 inhaleTime 변수 값 참조
            phaseText = "들이쉬기";
            color = "#28a745"; // 초록색
            scale = 1.2; // 커짐
            vibrateDevice([100, 50, 100]); // 들이쉬기 진동
            break;
        case 2: // 참기
            phaseDuration = holdTime; // 현재 holdTime 변수 값 참조
            phaseText = "참기";
            color = "#ffc107"; // 노란색 (경고)
            scale = 1.2; // 유지
            vibrateDevice([300]); // 참기 진동
            break;
        case 3: // 내쉬기
            phaseDuration = exhaleTime; // 현재 exhaleTime 변수 값 참조
            phaseText = "내쉬기";
            color = "#dc3545"; // 빨간색
            scale = 0.6; // 더 작게 줄어듦
            vibrateDevice([80, 50, 80, 50, 80]); // 내쉬기 진동
            break;
    }

    remainingTime = phaseDuration; // 현재 단계의 시작 시간을 저장
    // initial update, applying the scale for the current phase
    updateBreathingDisplay(phaseText, remainingTime, color, scale);

    // 원 표시 클래스 추가 (초기 한 번만)
    if (!circle.classList.contains('show')) {
        circle.classList.add('show');
    }

    clearInterval(intervalId); // 이전 인터벌 중지

    // phaseDuration이 0초일 경우, 즉시 다음 단계로 넘어가도록 처리
    if (phaseDuration <= 0) { // 0초 또는 음수일 경우 (부동 소수점 오차 고려)
        currentPhase++;
        if (currentPhase > 3) {
            startBreathingCycle();
        } else {
            runPhase();
        }
    } else {
        intervalId = setInterval(() => {
            remainingTime -= 0.5; // 0.5초마다 감소
            // 부동 소수점 오차를 줄이기 위해 반올림 후 소수점 첫째 자리까지 표시
            updateBreathingDisplay(phaseText, Math.round(remainingTime * 10) / 10, color, scale); // 'scale'을 계속 전달하여 애니메이션 유지

            if (remainingTime <= 0) { // 0초 또는 음수일 경우 (부동 소수점 오차 고려)
                clearInterval(intervalId); // 현재 인터벌 중지
                currentPhase++;
                if (currentPhase > 3) {
                    // 한 주기 완료
                    startBreathingCycle(); // 다음 주기 시작
                } else {
                    runPhase(); // 다음 단계 실행 (여기서 변경된 시간 변수가 적용됨)
                }
            }
        }, 500); // 0.5초마다 업데이트
    }
}

// 호흡 텍스트 및 원 업데이트
function updateBreathingDisplay(text, time, color, scale) {
    // 소수점 첫째 자리까지 표시
    breathingText.textContent = `${text} (${time.toFixed(1)}초)`;
    circle.style.backgroundColor = color;
    // 중요한 변경: transform은 translate(-50%, -50%)를 유지하면서 scale만 변경
    circle.style.transform = `translate(-50%, -50%) scale(${scale})`;
    circle.textContent = time.toFixed(1); // 원 안에 남은 시간 표시
}

// 호흡 중지
function stopBreathing() {
    isRunning = false;
    clearInterval(intervalId);
    breathingText.textContent = "";
    circle.classList.remove('show'); // 원 숨기기
    startButton.disabled = false;
    stopButton.disabled = true;

    // 타이머 조절 버튼은 이제 항상 활성화됩니다.
    // document.querySelectorAll('.timer-box button').forEach(btn => btn.disabled = false);
    // document.querySelectorAll('.timer-box .time-display').forEach(display => display.style.pointerEvents = 'auto');
}