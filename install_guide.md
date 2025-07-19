# 처음 실행시
## 라즈베리파이 업데이트
```bash
# Do you want to continue? [Y/n] 뜨면 y 입력
sudo apt update && apt upgrade
```

## 한글 설정
```bash
sudo raspi-config
```
- 5 Localisation Options -> Locale 선택
- 아래로 목록 내리다보면 ko_KR.UTF-8 UTF-8 항목이 있음
- 스페이스바를 누르면 [*] 이렇게 되는데 이 상태로 엔터 입력

### 폰트 설치
``` bash
sudo apt install fonts-unfonts-core fonts-nanum -y

# 설치 완료 후 재부팅 필요
sudo reboot now
```

## (옵션) VNC 허용
``` bash
sudo raspi-config
```
- 3 Interface Options -> VNC 선택
- Would you like the VNC Server to be enabled? 항목에서 YES 선택
- 이후 재부팅

# 프로그램 실행 준비

## npx(npm) 설치
```bash
# https://github.com/nvm-sh/nvm 공식 레포 참조
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash

# 설치가 되었는지 확인 (명령어 실행시 nvm이 떠야함)
command -v nvm

# npm 설치
nvm install 20

# 사용할 npm 버전 지정
nvm use 20
```

``` bash
# 실제 명령어 입력시 나오는 화면
antioch03@at03:~ $ nvm install 20
Downloading and installing node v20.19.4...
Downloading https://nodejs.org/dist/v20.19.4/node-v20.19.4-linux-arm64.tar.xz...
########################################################################### 100.0%
Computing checksum with sha256sum
Checksums matched!
Now using node v20.19.4 (npm v10.8.2)
Creating default alias: default -> 20 (-> v20.19.4)
antioch03@at03:~ $ nvm use 20
Now using node v20.19.4 (npm v10.8.2)
```

## 실행할 프로그램 설치
```bash
# 압축해제 (다운로드 폴더에 프로그램이 있다고 가정)
cd ~/Download
tar -zxvf church-billboard-deploy.tar.gz

# 필요한 라이브러리 설치
npm install
# added 61 packages, and audited 62 packages in 14s 이런 문구가 떠야 함
```

## 프로그램 실행
```bash
# 프로그램 시작
npm start

# 실행되는 주소를 웹 브라우저 검색창에 입력
#   ▲ Next.js 15.3.5
#   - Local:        http://localhost:3000
#   - Network:      http://192.168.0.60:3000
#
#    두 주소 모두 사용 가능하나, Network에서 뜨는 주소는 로컬망에 연결된 다른 기기도 접속 가능
```

- 웹 브라우저에서 최대화면이 필요한 경우 f11을 누르고, Control키와 '+'. '-' 버튼을 동시에 눌러 화면 배율을 조절 가능

# 추가적인 설정

## 마우스 포인터 숨기기

### 1단계: 데스크톱 환경을 X11로 전환
```bash
# 라즈베리파이 5부터는 기존의 X11방식이 아닌 Wayland 방식을 사용하기 때문에 마우스 포인터 숨기는게 쉽지 않음
# 따라서 설정창에서 Wayland 방식 대신 X11 방식을 사용하도록 변경해야함
sudo raspi-config
```
- 6 Advanced Options -> A6 Wayland 선택
- W1 X11 선택 후 엔터
- 시스템 재부팅
```bash
sudo reboot now
```

### 2단계: unclutter-xfixes 설치
- 재부팅 후 unclutter-xfixes 설치
``` bash
sudo apt update
sudo apt install unclutter-xfixes
```

### 3단계: 자동 시작 스크립트 생성
- 시스템이 부팅될 때마다 unclutter-xfixes가 자동으로 실행되도록 설정 파일을 생성
```bash
# vim 에디터가 없는 경우 설치
sudo apt install vim
sudo vim /etc/xdg/autostart/unclutter.desktop

#열린 편집기에 아래 내용을 그대로 복사하여 붙여넣기
[Desktop Entry]
Name=Unclutter
Comment=Hide the mouse cursor after a period of inactivity
Exec=unclutter-xfixes --start-hidden --hide-on-touch 
Terminal=false
Type=Application
```

- ':' 입력 후 'wq'를 입력한 후 엔터키를 눌러 변경사항 저장
- 이후 재부팅
```bash
sudo reboot now
```
- 부팅이 완료되면 마우스 커서가 보이지 않음
- 마우스를 움직이면 잠시 나타났다가 다시 자동으로 사라지는 것을 확인 가능

## 시스템 시작 시 영상 재생 자동화
- npm 실행 -> 웹 브라우저 실행 -> 전체화면 (f11) 순으로 실행하는 스크립트 작성 후 실행하는 구조

### 1단계: 실행 스크립트 생성 (start-nextapp.sh)
```bash
cd ~/
vim ~/start-nextapp.sh
```

- 아래 내용 그대로 복사 (#!/bin/bash 반드시 포함해야함)
```bash
#!/bin/bash

# NVM 환경 변수를 설정하고 nvm.sh 스크립트를 로드합니다.
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# npm start 명령을 실행합니다.
npm start
```
- 이후 ':' 입력 후 'wq' 를 입력 후 엔터를 눌러 변경사항 저장

- 실행파일에 실행 권한 부여
```bash
chmod +x ~/start-nextapp.sh
```

### 2단계: Next.js 앱 서비스 생성 (nextapp.service)

- systemd 서비스 파일을 생성
```bash
sudo vim /etc/systemd/system/nextapp.service
```

- 사용자 이름 확인
```bash
whoami
```

- 위 명령어 실행 결과를 복사하여 {user_name} 부분과 교체
- User와 WorkingDirectory는 반드시 자신의 환경에 맞게 수정해야 함
    - 프로그램 다운로드 후 압축 해제를 ~/Downloads에 했다고 가정
```bash
[Unit]
Description=Next.js Application Server
After=network.target

[Service]
# 'whoami' 명령어로 확인한 실제 사용자 이름으로 변경하세요.
User={user_name}
Group={user_name}
# Next.js 프로젝트가 있는 실제 전체 경로로 변경하세요.
WorkingDirectory=/home/{user_name}/Downloads

# 1단계에서 만든 실행 스크립트의 전체 경로를 지정합니다.
ExecStart=/home/{user_name}/start-nextapp.sh

Restart=always

[Install]
WantedBy=multi-user.target
```
- 변경사항 저장 후 터미널로 나오기 (:wq)

### 3단계: Chromium 키오스크 서비스 생성 (kiosk.service)
- 키오스크 브라우저를 위한 systemd 서비스 파일을 생성
```bash
sudo vim /etc/systemd/system/kiosk.service
```

- 아래 내용을 붙여넣음. 아까와 동일하게 {user_name}를 사용자 이름으로 변경
    - 이전에 whoami 명령어 결과
```bash
[Unit]
Description=Chromium Kiosk Mode
Requires=nextapp.service
After=graphical-session.target

[Service]
# 'whoami' 명령어로 확인한 실제 사용자 이름으로 변경하세요.
User={user_name}
Group={user_name}
Environment=DISPLAY=:0

# Next.js 앱이 완전히 준비될 때까지 기다리는 시간입니다. (필요시 조절)
ExecStartPre=/bin/sleep 15

# Chromium을 키오스크 모드로 실행합니다.
ExecStart=/usr/bin/chromium-browser --kiosk http://localhost:3000

[Install]
WantedBy=graphical.target
```

- ':wq'로 변경사항 저장 후 나오기

### 4단계: 서비스 활성화 및 재부팅
```bash
# systemd에 변경된 서비스 파일들 리로드
sudo systemctl daemon-reload


# 두 서비스를 부팅 시 자동 실행되도록 활성화
sudo systemctl enable nextapp.service
sudo systemctl enable kiosk.service


# 설정을 적용하기 위해 라즈베리파이를 재부팅
sudo reboot
```

- 재부팅 후 Next.js 앱이 실행되고, 잠시 후 Chromium 브라우저가 전체 화면으로 열리면 성공.

### 문제 해결
- 만약 문제가 발생하면 아래 명령어로 서비스의 상태와 로그를 확인하여 원인을 찾을 수 있음
```bash
# 서비스 상태 확인 (active (running)인지 확인)
systemctl status nextapp.service
systemctl status kiosk.service

# 서비스 상세 로그 확인
journalctl -u nextapp.service
```

## 화면 절전 비활성화
- 라즈베리파이 gui 환경에서 화면 절전 비활성화를 위해 다음의 과정 필요
    - 시작 메뉴 (왼쪽 상단 라즈베리 아이콘) 클릭
    - 기본 설정 (Preferences)
    - Raspberry Pi Configuration (라즈베리 파이 설정)
    - 창이 열리면 Display (디스플레이) 탭을 선택
    - Screen Blanking (화면 꺼짐) 항목을 찾아서 **Disable (비활성화)**로 변경.
    - OK를 클릭하여 설정을 저장합니다.

- 재부팅 하면 화면 절전 비활성화됨
