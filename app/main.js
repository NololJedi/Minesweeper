import './style/app.scss';
import jQuery from "jquery";
import flag_for_bomb from './flag.svg';
import Timer from './Timer';

window.$ = window.jQuery = jQuery;

/*Main game loop*/
$(function () {
        'use strict';
        /*Global constants*/
        const DEFAULT_FIELD_SIZE = 8;
        const FIELD_INDEX = 5;
        const DEFAULT_BOMBS_COUNT = 10;
        const MIN_BOMBS_COUNT = 10;
        const MAX_BOMBS_COUNT = 250;
        //Classes
        const BOMB_FLAGGED = "flag";
        const CELL_OPEN = "open";
        const BOOM_IDENTIFIER = "boom";
        const FIRST_CLICK_FLAG = "firstClick";
        const BOMB_COUNTER = "count";
        //Resources
        const FLAG_SVG_PATH = flag_for_bomb;
        const RELOAD_GAME = "Reload";
        //Messages
        const GAME_OVER_FAIL = "Booom!!! You lost. Bombs remaining: ";
        const GAME_OVER_SUCCESS = "Congratulations! All bombs were defused.";
        const BOMBS_COUNT_NOT_VALID_TOO_MUCH = "Too much bombs.";
        const BOMBS_COUNT_NOT_VALID_NOT_ENOUGH = "Not enough bombs.";
        const GAME_IN_PROCESS = "Game is in process.";

        /*Variables*/
        let field = $('#field');
        let result = $('#result');
        let bombsCountHolder = $('#bombs');
        let startButton = $('#start');
        let errorMessage = $('#error');
        let viewer =  $('#viewer');
        let isFirstClick = true;
        let flagsCount;
        let timeViewer = new Timer();

        renderField(DEFAULT_FIELD_SIZE, field);

        /*Set listeners*/
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
            result.text(GAME_IN_PROCESS + ` Flags remaining - ${flagsCount}`);
        });

        /*Game functions*/
        function startGame() {
            timeViewer.start();
            let bombsCount = +bombsCountHolder.val();
            flagsCount = bombsCount;
            let size = calculateFiledSize(bombsCount);
            renderField(size, field);

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

                clickCell(this, tableRows, size, bombsCount);
            });

            cells.contextmenu(function (event) {
                event = window.event;
                event.preventDefault();

                if (!isFirstClick) {
                    let image = this.getElementsByTagName("img")[0];
                    if (image) {
                        image.remove();
                        flagsCount++;
                        result.text(GAME_IN_PROCESS + ` Flags remaining - ${flagsCount}`)
                    } else if (!this.classList.contains("open") && flagsCount !== 0) {
                        let svg = document.createElement("img");
                        svg.src = FLAG_SVG_PATH;
                        this.appendChild(svg);
                        this.classList.add("flag");
                        flagsCount--;
                        result.text(GAME_IN_PROCESS + ` Flags remaining - ${flagsCount}`)
                    }
                }
            })
        }

        function clickCell(object, tableRows, size, bombsCount) {
            if ($(object).data(BOOM_IDENTIFIER) === true) {
                finishGame(GAME_OVER_FAIL + getRemainingBombs(tableRows, size, bombsCount));
            } else {
                object.setAttribute("id", "selected");
                object.classList.add("open");
                removeFlag(object);
                showBombIdentifier(object);
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

                if (object.innerHTML === "") {
                    openOtherCells(xCoordinate, yCoordinate, tableRows, size);
                }

                object.removeAttribute("id");
            }

            if (isGameFinished(tableRows, size, bombsCount)) {
                finishGame(GAME_OVER_SUCCESS);
            }

        }

        function renderField(size, field) {
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

        function setBombs(tableRows, bombsCount, size) {
            for (let index = 1; index <= bombsCount; index++) {
                setBomb(size, tableRows);
            }
        }

        function setBomb(size, tableRows) {
            let xCoordinate = getRandomInt(size);
            let yCoordinate = getRandomInt(size);

            let currentCell = tableRows.eq(xCoordinate).children().eq(yCoordinate);
            if (currentCell.data(BOOM_IDENTIFIER) === true || currentCell.prop("id") === FIRST_CLICK_FLAG) {
                setBomb(size, tableRows);
            } else {
                tableRows.eq(xCoordinate).children().eq(yCoordinate).data(BOOM_IDENTIFIER, true)
            }
        }

        function getRandomInt(max) {
            let number = Math.floor(Math.random() * Math.floor(max));

            if (number === max) {
                return getRandomInt(max);
            }

            return number;
        }

        function setBombsIdentifiers(tableRows, size) {
            for (let xCoordinateIndex = 0; xCoordinateIndex < size; xCoordinateIndex++) {
                for (let yCoordinateIndex = 0; yCoordinateIndex < size; yCoordinateIndex++) {
                    let bombCounter = 0;

                    for (let checkXIndex = xCoordinateIndex - 1; checkXIndex <= xCoordinateIndex + 1; checkXIndex++) {
                        for (let checkYIndex = yCoordinateIndex - 1; checkYIndex <= yCoordinateIndex + 1; checkYIndex++) {
                            if (checkXIndex >= 0 && checkXIndex < size && checkYIndex >= 0 && checkYIndex < size) {
                                if (tableRows.eq(checkXIndex).children().eq(checkYIndex).data(BOOM_IDENTIFIER) === true) {
                                    bombCounter++;
                                }
                            }
                        }
                    }
                    if (bombCounter !== 0) {
                        if (tableRows.eq(xCoordinateIndex).children().eq(yCoordinateIndex).data(BOOM_IDENTIFIER) !== true) {
                            tableRows.eq(xCoordinateIndex).children().eq(yCoordinateIndex).data(BOMB_COUNTER, bombCounter);
                        }
                    }
                }
            }
        }

        function getRemainingBombs(tableRows, size, bombsCount) {
            let currentCount = 0;
            for (let xIndex = 0; xIndex < size; xIndex++) {
                for (let yIndex = 0; yIndex < size; yIndex++) {
                    let currentCell = tableRows.eq(xIndex).children().eq(yIndex);
                    if (currentCell.data(BOOM_IDENTIFIER) === true && currentCell.hasClass(BOMB_FLAGGED)) {
                        currentCount++;
                    }
                }
            }
            return bombsCount - currentCount;
        }

        function openOtherCells(xCoordinate, yCoordinate, tableRows, size) {
            for (let checkXIndex = xCoordinate - 1; checkXIndex <= xCoordinate + 1; checkXIndex++) {
                for (let checkYIndex = yCoordinate - 1; checkYIndex <= yCoordinate + 1; checkYIndex++) {
                    if (checkXIndex >= 0 && checkXIndex < size && checkYIndex >= 0 && checkYIndex < size) {
                        let currentCell = tableRows.eq(checkXIndex).children().eq(checkYIndex);
                        if (currentCell.data(BOOM_IDENTIFIER) !== true
                            && !currentCell.hasClass(CELL_OPEN)
                            && !currentCell.hasClass(BOMB_FLAGGED)) {
                            if (!currentCell.data(BOMB_COUNTER)) {
                                currentCell.attr("class", CELL_OPEN);
                                currentCell.text(currentCell.data(BOMB_COUNTER));
                                removeFlag(currentCell);
                                openOtherCells(checkXIndex, checkYIndex, tableRows, size);
                            } else if (currentCell.data(BOMB_COUNTER) < 3) {
                                currentCell.attr("class", CELL_OPEN);
                                currentCell.text(currentCell.data(BOMB_COUNTER));
                                removeFlag(currentCell);
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
            let cells = $("td");
            for (let index = 0; index < cells.length; index++) {
                let currentCell = cells.eq(index);
                if (currentCell.data(BOOM_IDENTIFIER) === true) {
                    currentCell.attr("class", BOOM_IDENTIFIER);
                }
            }
            timeViewer.reset();
            result.text(message);

            cells.unbind("click");
            cells.unbind("contextmenu");
            cells.contextmenu(function (event) {
                event = window.event;
                event.preventDefault();
            });
        }

        function reloadGame() {
            field.text("");
            timeViewer.reset();
            result.text("");
            isFirstClick = true;
            flagsCount = 0;
        }

        function showBombIdentifier(object) {
            if ($(object).data(BOMB_COUNTER)) {
                $(object).text($(object).data(BOMB_COUNTER));
            }
        }

        function removeFlag(object) {
            let image = $(object).children().eq(0);
            if (image.is("img")) {
                image.remove();
                flagsCount++;
                result.text(GAME_IN_PROCESS + ` Flags remaining - ${flagsCount}`);
            }
        }

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
    }
);