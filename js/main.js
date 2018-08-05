'use strict';

/*Global constants*/
const DEFAULT_FIELD_SIZE = 8;
const FIELD_INDEX = 5;
const DEFAULT_BOMBS_COUNT = 10;
const MIN_BOMBS_COUNT = 10;
const MAX_BOMBS_COUNT = 250;

//Classes
const BOMB_IDENTIFIER = "bomb";
const BOOM_IDENTIFIER = "boom";
const BOMB_FLAGGED = "flag";
const CELL_OPEN = "open";
const HIDE_IDENTIFIER = "hide_identifier";
const FIRST_CLICK_FLAG = "firstClick";

//Resources
const FLAG_SVG_PATH = "flag.svg";
const RELOAD_GAME = "Reload";

//Messages
const GAME_OVER_FAIL = "Booom!!! You lost. Bombs remaining: ";
const GAME_OVER_SUCCESS = "Congratulations! All bombs were defused.";
const BOMBS_COUNT_NOT_VALID_TOO_MUCH = "Too much bombs.";
const BOMBS_COUNT_NOT_VALID_NOT_ENOUGH = "Not enough bombs.";
const GAME_IN_PROCESS = "Game is in process.";

/*Utils functions*/
function calculateFiledSize(bombsCount) {
    if (bombsCount === DEFAULT_BOMBS_COUNT || bombsCount < DEFAULT_BOMBS_COUNT) {
        return DEFAULT_FIELD_SIZE;
    }

    let index = Math.round(bombsCount / 10) * 10;

    if (index === DEFAULT_BOMBS_COUNT) {
        return DEFAULT_FIELD_SIZE;
    } else {
        index = index / DEFAULT_BOMBS_COUNT;

        return DEFAULT_FIELD_SIZE + index + FIELD_INDEX;
    }
}

function getRandomInt(max) {
    let number = Math.floor(Math.random() * Math.floor(max));

    if (number === max) {
        return getRandomInt(max);
    }

    return number;
}

/*Main game loop*/
$(function () {
        /*Variables*/
        let field = $('#field');
        let viewer = $('#viewer');
        let result = $('#result');
        let bombsCountHolder = $('#bombs');
        let startButton = $('#start');
        let errorMessage = $('#error');
        let seconds = 0;
        let minutes = 0;
        let hours = 0;
        let time;
        let isFirstClick = true;

        renderField(DEFAULT_FIELD_SIZE);

        bombsCountHolder.on("input", function () {
            let currentBombsCount = +bombsCountHolder.val();
            if (currentBombsCount >= MIN_BOMBS_COUNT && currentBombsCount < MAX_BOMBS_COUNT) {
                startButton.prop("disabled", false);
                errorMessage.text("");
            } else {
                startButton.prop("disabled", true);
                if (currentBombsCount < MIN_BOMBS_COUNT) {
                    errorMessage.text(BOMBS_COUNT_NOT_VALID_NOT_ENOUGH);
                }
                if (currentBombsCount > MAX_BOMBS_COUNT) {
                    errorMessage.text(BOMBS_COUNT_NOT_VALID_TOO_MUCH);
                }
            }
        });

        startButton.click(function (event) {
            startButton.text(RELOAD_GAME);
            event.preventDefault();
            reloadGame();
            startGame();
            result.text(GAME_IN_PROCESS);
        });

        function startGame() {
            timer();
            let bombsCount = +bombsCountHolder.val();
            let size = calculateFiledSize(bombsCount);
            renderField(size);

            let cells = $("td");

            cells.click(function () {
                let tableRows = $("tr");
                if (isFirstClick) {
                    this.setAttribute("id", FIRST_CLICK_FLAG);
                    setBombs(tableRows, bombsCount, size);
                    setBombsIdentifiers(tableRows, size);
                    isFirstClick = false;
                    this.removeAttribute("id");
                }
                clickCell(this, tableRows, size, bombsCount)
            });

            cells.contextmenu(function (event) {
                event = window.event;
                event.preventDefault();

                if (!isFirstClick) {
                    let image = this.getElementsByTagName("img")[0];
                    if (image) {
                        showBombIdentifier(this);
                        image.remove();
                    } else if (!this.classList.contains("open")) {
                        let svg = document.createElement("img");
                        svg.src = FLAG_SVG_PATH;
                        this.appendChild(svg);
                        this.classList.add("flag");
                        hideBombIdentifier(this);
                    }
                }
            })
        }

        function renderField(size) {
            for (let rowsIndex = 1; rowsIndex <= size; rowsIndex++) {
                let tr = $("<tr>");
                tr.appendTo(field);
                for (let columnsIndex = 1; columnsIndex <= size; columnsIndex++) {
                    let currentTableRow = $("tr")[rowsIndex - 1];
                    let td = $("<td>");
                    td.appendTo(currentTableRow);
                }
            }
        }

        function countTime() {
            seconds++;
            if (seconds >= 60) {
                seconds = 0;
                minutes++;
                if (minutes >= 60) {
                    minutes = 0;
                    hours++;
                }
            }

            let value = (hours ? (hours > 9 ? hours : "0" + hours) : "00")
                + ":" + (minutes ? (minutes > 9 ? minutes : "0" + minutes) : "00")
                + ":" + (seconds > 9 ? seconds : "0" + seconds);
            viewer.text(value);
            timer();
        }

        function timer() {
            time = setTimeout(countTime, 1000);
        }

        function setBombs(tableRows, bombsCount, size) {
            for (let index = 1; index <= bombsCount; index++) {
                setBomb(size, tableRows);
            }
        }

        function setBomb(size, tableRows) {
            let xCoordinate = getRandomInt(size);
            let yCoordinate = getRandomInt(size);

            let currentCell = tableRows.eq(xCoordinate).children().eq(yCoordinate);
            if (currentCell.hasClass(BOMB_IDENTIFIER) || currentCell.prop("id") === FIRST_CLICK_FLAG) {
                setBomb(size, tableRows);
            } else {
                tableRows.eq(xCoordinate).children().eq(yCoordinate).attr("class", BOMB_IDENTIFIER)
            }
        }

        function setBombsIdentifiers(tableRows, size) {
            for (let xCoordinateIndex = 0; xCoordinateIndex < size; xCoordinateIndex++) {
                for (let yCoordinateIndex = 0; yCoordinateIndex < size; yCoordinateIndex++) {
                    let bombCounter = 0;

                    for (let checkXIndex = xCoordinateIndex - 1; checkXIndex <= xCoordinateIndex + 1; checkXIndex++) {
                        for (let checkYIndex = yCoordinateIndex - 1; checkYIndex <= yCoordinateIndex + 1; checkYIndex++) {
                            if (checkXIndex >= 0 && checkXIndex < size && checkYIndex >= 0 && checkYIndex < size) {
                                if (tableRows.eq(checkXIndex).children().eq(checkYIndex).hasClass(BOMB_IDENTIFIER)) {
                                    bombCounter++;
                                }
                            }
                        }
                    }
                    if (bombCounter !== 0) {
                        if (!tableRows.eq(xCoordinateIndex).children().eq(yCoordinateIndex).hasClass(BOMB_IDENTIFIER)) {
                            let span = "<span>" + bombCounter + "</span>";
                            tableRows.eq(xCoordinateIndex).children().eq(yCoordinateIndex).append(span);
                        }
                    }
                }
            }
        }

        function clickCell(object, tableRows, size, bombsCount) {
            if (object.classList[0] === BOMB_IDENTIFIER) {
                finishGame(GAME_OVER_FAIL + getRemainingBombs(tableRows, size, bombsCount));
            } else {
                object.setAttribute("id", "selected");
                object.classList.add("open");

                removeFlag(object);

                let xCoordinate;
                let yCoordinate;
                for (let xIndex = 0; xIndex < size; xIndex++) {
                    for (let yIndex = 0; yIndex < size; yIndex++) {
                        if (tableRows.eq(xIndex).children().eq(yIndex).prop("id") === "selected") {
                            xCoordinate = xIndex;
                            yCoordinate = yIndex;
                            break;
                        }
                    }
                }

                if (+object.innerHTML < 2 || object.innerHTML === "") {
                    openOtherCells(xCoordinate, yCoordinate, tableRows, size);
                }

                object.removeAttribute("id");
            }

            if (isGameFinished(tableRows, size, bombsCount)) {
                finishGame(GAME_OVER_SUCCESS);
            }

        }

        function getRemainingBombs(tableRows, size, bombsCount) {
            let currentCount = 0;
            for (let xIndex = 0; xIndex < size; xIndex++) {
                for (let yIndex = 0; yIndex < size; yIndex++) {
                    let currentCell = tableRows.eq(xIndex).children().eq(yIndex);
                    if (currentCell.hasClass(BOMB_IDENTIFIER) && currentCell.hasClass(BOMB_FLAGGED)) {
                        currentCount++;
                    }
                }
            }
            return bombsCount - currentCount;
        }

        function openOtherCells(xCoordinate, yCoordinate, tableRows, size) {
            for (let checkXIndex = xCoordinate - 1; checkXIndex <= xCoordinate + 1; checkXIndex++) {
                for (let checkYIndex = yCoordinate - 1; checkYIndex <= yCoordinate + 1; checkYIndex++) {
                    if (checkXIndex > 0 && checkXIndex < size && checkYIndex > 0 && checkYIndex < size) {
                        let currentCell = tableRows.eq(checkXIndex).children().eq(checkYIndex);
                        if (!currentCell.hasClass(BOMB_IDENTIFIER) && !currentCell.hasClass(CELL_OPEN)) {
                            if (+currentCell.children().eq(0).text() < 2) {
                                currentCell.attr("class", CELL_OPEN);
                                removeFlag(currentCell[0]);
                                openOtherCells(checkXIndex, checkYIndex, tableRows, size);
                                break;
                            } else {
                                if (+currentCell.children().eq(0).text() === 2) {
                                    currentCell.attr("class", CELL_OPEN);
                                    removeFlag(currentCell[0]);
                                }
                            }
                        }
                    }
                }
            }
        }

        function isGameFinished(tableRows, size, bombsCount) {
            let currentBombCount = 0;
            for (let xCoordinate = 0; xCoordinate < size; xCoordinate++) {
                for (let yCoordinate = 0; yCoordinate < size; yCoordinate++) {
                    if (!tableRows.eq(xCoordinate).children().eq(yCoordinate).hasClass(CELL_OPEN)) {
                        currentBombCount++;
                    }
                }
            }
            return currentBombCount === bombsCount;
        }

        function finishGame(message) {
            $(".bomb").attr("class", BOOM_IDENTIFIER);
            clearTimeout(time);
            result.text(message);

            let cells = $("td");
            cells.unbind("click");
            cells.unbind("contextmenu");
            cells.contextmenu(function (event) {
                event = window.event;
                event.preventDefault();
            });
        }

        function reloadGame() {
            field.text("");
            clearTimeout(time);
            reloadTime();
            result.text("");
            isFirstClick = true;
        }

        function reloadTime() {
            viewer.text("");
            seconds = 0;
            minutes = 0;
            hours = 0;
        }

        function showBombIdentifier(object) {
            let span = object.getElementsByTagName("span")[0];
            if (span) {
                span.classList.remove(HIDE_IDENTIFIER);
            }
        }

        function hideBombIdentifier(object) {
            let span = object.getElementsByTagName("span")[0];
            if (span) {
                span.classList.add(HIDE_IDENTIFIER);
            }
        }

        function removeFlag(object) {
            let image = object.getElementsByTagName("img")[0];
            if (image) {
                image.remove();
                showBombIdentifier(object);
            }
        }
    }
);