import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
    return ( 
        <button className="square" onClick={ props.onClick }>
            { props.value }
        </button>
    );
}
  
class Board extends React.Component {
    renderSquare(i) {
        return ( 
            <Square 
                value={this.props.squares[i]}
                onClick={() => { this.props.onClick(i) }}
            />
        );
    }
  
    render() {
        return (
            <div>
                <div className="board-row">
                    {this.renderSquare(0)}
                    {this.renderSquare(1)}
                    {this.renderSquare(2)}
                </div>
                <div className="board-row">
                    {this.renderSquare(3)}
                    {this.renderSquare(4)}
                    {this.renderSquare(5)}
                </div>
                <div className="board-row">
                    {this.renderSquare(6)}
                    {this.renderSquare(7)}
                    {this.renderSquare(8)}
                </div>
            </div>
        );
    }
}
  
class Game extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            history: [{
                squares: Array(9).fill(null)
            }],
            stepNumber: 0,
            xIsNext: true
        }
    }

    handleClick(i) {
        // const history = this.state.history;
        const history = this.state.history.slice(0, this.state.stepNumber + 1);
        const current = history[history.length - 1];
        const squares = current.squares.slice();
        if (calcWinner(squares) || squares[i]) {
            return;
        }
        squares[i] = this.state.xIsNext ? 'X' : 'O';
        this.setState({
            history: history.concat([{ //concat doesn't mutate the original array
                squares: squares
            }]),
            stepNumber: history.length,
            xIsNext: !this.state.xIsNext
        });
    }

    jumpTo(step) {
        //받아온 move에 해당하는 값을 히스토리에서 꺼내 보여줘야하는데..
        //현재 GameBoard에서는 히스토리의 제일 최근 값을 보여주고 있는데 어떡하지?
        //GameBoard에서 보여줄 때 current를 history의 최근 값이 아니라 stepNumber값으로 불러오도록 하면 되겠다.
        //그렇다면 다음 move(GameBoard를 새로 클릭) 때 동작은
        //(새 move 전엔 클릭한 시점 값을 보여줄 뿐이므로, history 변경은 handleClick에서 이루어져야 할 작업)
        // 1. stepNumber를 ++ 해줘야 하고,
        // 2. history의 마지막에 합쳐주던 squares state를 클릭한 시점 이후로 넣어줘야 함.
        //    a. 자연스럽게 게임 진행하다 다음 칸을 누른 경우와
        //    b. 기록에서 누른 지점부터 게임을 이어가는 경우 
        //    => handleClick에서 현 stepNumber까지의 history만 잘라와 새로운 move를 추가하면 됨.
        //그때 누구 차례였는지도 알아야 하는데? xIsNext가 history에 같이 박제되어야 하는가? -> X
        //새로운 move가 있었을 때가 아니라, 과거 시점으로 돌아갔을 때 차례를 함께 보여줘야 하기 때문에 
        //여기 jumpTo에서 stepNumber 짝수 여부에 따라 xIsNext도 변경한다.

        this.setState({
            stepNumber: step,
            xIsNext: (step % 2) === 0
        });
    }

    render() {
        const history = this.state.history;
        // 클릭한 시점의 값을 보여주기 위해 stepNumber 사용하도록 변경
        // const current = history[history.length - 1];
        const current = history[this.state.stepNumber];
        const winner = calcWinner(current.squares);

        const moves = history.map((step, move) => {
            const desc = move ?
                'Go to move #' + move :
                'Go to game start';
            return (
                <li key={move}>
                    {/* 여기서 this.jumpTo()를 곧장 써서 render에서 setState를 하지 말라는 오류가 남
                    클릭했을 때 실행될 함수 정의를 넣어줘야 하는데 this.jumpTo(move)로 곧장 jumpTo를 호출했으니
                    render() 시 jumpTo가 실행되어 setState를 하게 되고 -> state 변경으로 render()가 호출되는 무한 루프 오류. */}
                    {/* <button onClick={ this.jumpTo(move) }>{ desc }</button> */}
                    <button onClick={() => this.jumpTo(move) }>{ desc }</button>
                </li>
            )
        })

        let status;
        if (winner) {
            status = 'Winner is ' + winner;
        } else {
            status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
        }
  
        return (
            <div className="game">
                <div className="game-board">
                    <Board
                        squares = { current.squares }
                        onClick={(i) => { this.handleClick(i) }}
                    />
                </div>
                <div className="game-info">
                    <div>{ status }</div>
                    <ol>{ moves }</ol>
                </div>
            </div>
        );
    }
}
  
// ========================================
  
ReactDOM.render(
    <Game />,
    document.getElementById('root')
);

function calcWinner(squares) {
    const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ];
    for (let i=0; i<lines.length; i++) {
        const [a, b, c] = lines[i];
        if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
            return squares[a];
        }
    }
    return null;
}
  