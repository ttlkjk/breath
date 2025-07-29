// script.js

// 타이머 설정 초기값
let inhaleTime = 2.0;   // 들이쉬기 시간 (소수점 포함)
let holdTime = 0.0;     // 참기 시간 (소수점 포함)
let exhaleTime = 2.0;   // 내쉬기 시간 (소수점 포함)
let prepareTime = 0.0;  // 준비 시간 (소수점 포함)

// 원 크기 스케일링의 기준 스케일 값
const maxCircleScale = 1.2; // 원이 가장 커졌을 때의 스케일 (최대 윤곽선과 일치)
const minCircleScale = 0.6; // 원이 가장 작아졌을 때의 스케일 (최소 윤곽선과 일치)

// 0: 준비, 1: 들이쉬기, 2: 참기, 3: 내쉬기 (현재 index.html 및 script.js의 순서에 따름)
let currentPhase = 0;
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
    if ("vibrate" in navigator) {
        navigator.vibrate(pattern);
    } else {
        console.log("이 기기는 진동 기능을 지원하지 않습니다.");
    }
}
// --------------------------------------------------------

// 타이머 값 변경 함수
function changeTime(type, delta) {
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
}

// 시작 버튼 클릭 이벤트
startButton.addEventListener('click', () => {
    if (isRunning) return;

    isRunning = true;
    startButton.disabled = true;
    stopButton.disabled = false;
    completedCycles = 0; // 주기 초기화 (새로운 시작이므로)

    // 시작 시 원 초기화 (가장 작은 크기로, 애니메이션 없이)
    circle.style.transitionDuration = '0s'; // 즉시 변경
    circle.style.transform = `translate(-50%, -50%) scale(${minCircleScale})`;
    // Reflow 강제 (이전 상태를 브라우저가 확실히 인식하도록)
    void circle.offsetWidth;
    
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
    let startScale; // 애니메이션 시작 스케일
    let endScale;   // 애니메이션 종료 스케일 (목표 스케일)
    
    clearInterval(intervalId); // 이전 인터벌 중지

    // 원의 표시 상태 관리
    if (!circle.classList.contains('show')) {
        circle.classList.add('show');
    }

    switch (currentPhase) {
        case 0: // 준비
            phaseDuration = prepareTime; // 현재 prepareTime 변수 값 참조
            phaseText = "준비";
            color = "#6c757d"; // 회색
            
            startScale = minCircleScale; // 준비 단계는 가장 작은 원 크기 유지
            endScale = minCircleScale;

            // 즉시 스케일 변경 (애니메이션 없음)
            circle.style.transitionDuration = '0s';
            circle.style.transform = `translate(-50%, -50%) scale(${startScale})`;
            // Reflow 강제 (이전 transform 상태가 확실히 적용되도록)
            void circle.offsetWidth; 
            break;

        case 1: // 들이쉬기
            phaseDuration = inhaleTime; // 현재 inhaleTime 변수 값 참조
            phaseText = "들이쉬기";
            color = "#28a745"; // 초록색
            
            startScale = minCircleScale; // 들이쉬기 시작은 작은 원
            endScale = maxCircleScale;   // 들이쉬기 끝은 큰 원

            // 원을 시작 스케일로 즉시 설정 (트랜지션 끄고)
            circle.style.transitionDuration = '0s';
            circle.style.transform = `translate(-50%, -50%) scale(${startScale})`;
            // Reflow 강제 (이전 transform 상태가 확실히 적용되도록)
            void circle.offsetWidth; 
            
            // requestAnimationFrame을 사용하여 다음 프레임에서 애니메이션 시작
            requestAnimationFrame(() => {
                if (!isRunning) return; // 중지 버튼이 눌렸으면 애니메이션 시작 안함
                circle.style.transitionDuration = `${phaseDuration}s`; // 들이쉬기 시간만큼 애니메이션
                circle.style.transform = `translate(-50%, -50%) scale(${endScale})`;
            });
            vibrateDevice([100, 50, 100]);
            break;

        case 2: // 참기
            phaseDuration = holdTime; // 현재 holdTime 변수 값 참조
            phaseText = "참기";
            color = "#ffc107"; // 노란색 (경고)
            
            // 들이쉬는 단계에서 도달한 최종 스케일로 고정 (애니메이션 없음, 즉시 변경)
            startScale = maxCircleScale; // 참기 시작은 큰 원
            endScale = maxCircleScale; // 참기 끝도 큰 원

            circle.style.transitionDuration = '0s'; // 즉시 스케일 변경 (애니메이션 없음)
            circle.style.transform = `translate(-50%, -50%) scale(${startScale})`;
            // Reflow 강제
            void circle.offsetWidth; 
            vibrateDevice([300]);
            break;

        case 3: // 내쉬기
            phaseDuration = exhaleTime; // 현재 exhaleTime 변수 값 참조
            phaseText = "내쉬기";
            color = "#dc3545"; // 빨간색
            
            startScale = maxCircleScale; // 내쉬기 시작은 큰 원
            endScale = minCircleScale;   // 내쉬기 끝은 작은 원

            // 원을 시작 스케일로 즉시 설정 (트랜지션 끄고)
            circle.style.transitionDuration = '0s';
            circle.style.transform = `translate(-50%, -50%) scale(${startScale})`;
            // Reflow 강제
            void circle.offsetWidth; 
            
            // requestAnimationFrame을 사용하여 다음 프레임에서 애니메이션 시작
            requestAnimationFrame(() => {
                if (!isRunning) return; // 중지 버튼이 눌렸으면 애니메이션 시작 안함
                circle.style.transitionDuration = `${phaseDuration}s`; // 내쉬기 시간만큼 애니메이션
                circle.style.transform = `translate(-50%, -50%) scale(${endScale})`;
            });
            vibrateDevice([80, 50, 80, 50, 80]);
            break;
    }

    remainingTime = phaseDuration; // 현재 단계의 시작 시간을 저장
    // initial update, applying the scale for the current phase
    updateBreathingDisplay(phaseText, remainingTime, color); // scale 매개변수는 이제 updateBreathingDisplay에서 사용하지 않습니다.

    // phaseDuration이 0초일 경우, 즉시 다음 단계로 넘어가도록 처리
    if (phaseDuration <= 0) {
        currentPhase++;
        if (currentPhase > 3) { // 3은 내쉬기 단계 (0,1,2,3 총 4단계)
            startBreathingCycle(); // 다음 주기 시작
        } else {
            runPhase(); // 다음 단계 실행
        }
    } else {
        intervalId = setInterval(() => {
            remainingTime -= 0.5; // 0.5초마다 감소
            // 부동 소수점 오차를 줄이기 위해 반올림 후 소수점 첫째 자리까지 표시
            updateBreathingDisplay(phaseText, Math.round(remainingTime * 10) / 10, color); // scale 매개변수 제거
            if (remainingTime <= 0) {
                clearInterval(intervalId); // 현재 인터벌 중지
                currentPhase++;
                if (currentPhase > 3) {
                    startBreathingCycle(); // 다음 주기 시작
                } else {
                    runPhase(); // 다음 단계 실행
                }
            }
        }, 500); // 0.5초마다 업데이트
    }
}

// 호흡 텍스트 및 원 업데이트
function updateBreathingDisplay(text, time, color) { // scale 매개변수 제거
    // 소수점 첫째 자리까지 표시
    breathingText.textContent = `${text} (${time.toFixed(1)}초)`;
    circle.style.backgroundColor = color;
    // 중요한 변경: transform은 이제 runPhase에서 직접 제어하며, 여기서는 텍스트만 변경
    circle.textContent = text; // 원 안에 남은 시간 대신 현재 단계 텍스트 표시
}

// 호흡 중지
function stopBreathing() {
    isRunning = false;
    clearInterval(intervalId);
    breathingText.textContent = "";
    circle.classList.remove('show'); // 원 숨기기
    startButton.disabled = false;
    stopButton.disabled = true;

    // 중지 시 원을 초기 상태 (가장 작게)로 되돌림 (부드러운 전환)
    circle.style.transitionDuration = '0.5s'; 
    circle.style.transform = `translate(-50%, -50%) scale(${minCircleScale})`;
}