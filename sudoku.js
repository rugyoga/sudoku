"use strict";

var app = angular.module("Sudoku", []);
app.controller(
  'LinesController',
  function($scope,   sudoku)
  {
    $scope.boxes  =  sudoku.state.boxes;
    $scope.vlines =  sudoku.state.vlines;
    $scope.hlines =  sudoku.state.hlines;
  }
);

app.controller(
  'MovesController',
  function($scope,  sudoku)
  {
    $scope.moves  =  sudoku.moves;
  }
);

app.controller(
  'UndoController',
   function($scope, sudoku)
   {
     $scope.move = function(square, value)
     {
       document.getElementById('cell_' + square).value = value ? value : '';
     };
     $scope.undo = function()
     {
       var m = sudoku.undo();
       if (m) $scope.move(m.square, m.before);
     };
   }
);

app.directive(
  'upload',
  function()
  {
    return function(scope, element, attributes)
    {
      var sudoku = element.injector().get("sudoku");
      function move (square, value)
      {
        document.getElementById('cell_' + square).value = value ? value : '';
      }
      function readBoard(text)
      {
        var lines = text.split('\n');
        for (var i = 0; i < lines.length; i++)
        {
          var line = lines[i];
          var cells = line.split(/[^0-9]+/);
          for (var j = 0; j < cells.length; j++)
          {
            var n = parseInt(cells[j], 10);
            if (1 <= n && n <= 9)
            {
              var square = i*9+j;
              sudoku.put(square, n);
              move(square, n);
            }
          }
        }
        scope.$digest();
      }

      element.bind(
        'change',
        function(event)
        {
          scope.$apply(
            function()
            {
              var file = event.target.files[0];
              var reader = new FileReader();
              reader.onload = function(progressEvent){ readBoard(this.result); };
              reader.readAsText(file);
            }
          );
        }
      );
    };
  }
);

app.factory(
  "sudoku",
  function ()
  {
    var N     = 9;
    var VALID = 'valid', INVALID = 'invalid', SOLVED = 'solved';
    var board = new Array(81);
    var moves = [];
    var self  = this;

    function mkBox(nw)
    {
      return [nw,    nw+ 1, nw+ 2,
              nw+ 9, nw+10, nw+11,
              nw+18, nw+19, nw+20];
    }

    function mkLine(nw,d)
    {
      var result = [];
      for (var i = 0; i < N; i++)
        result.push( nw + i*d );
      return result;
    }

    function mkBoxes()
    {
      var v = [0, 3, 6, 27, 30, 33, 54, 57, 60];
      for (var i = 0; i < N; i++)
        v[i] = mkBox(v[i]);
      return v;
    }

    function mkHLines()
    {
      var v = [];
      for (var i = 0; i < N; i++)
        v.push( mkLine( i*N, 1 ) );
      return v;
    }

    function mkVLines()
    {
      var v = [];
      for (var i = 0; i < N; i++)
        v.push( mkLine( i, N ) );
      return v;
    }

    function mkState()
    {
      var boxes  = mkBoxes();
      var hlines = mkHLines();
      var vlines = mkVLines();
      var board_state = new Array(81);
      var boxes_state = [];
      var vlines_state = [];
      var hlines_state = [];
      for (var i = 0; i < board_state.length; i++)
        board_state[i] = {};
      for (i = 0; i < N; i++)
      {
        var box = [], vline = [], hline = [];
        boxes_state.push(box);
        vlines_state.push(vline);
        hlines_state.push(hline);
        for (var j = 0; j < N; j++)
        {
          board_state[boxes[i][j]].box = box;
          board_state[vlines[i][j]].vline = vline;
          board_state[hlines[i][j]].hline = hline;
        }
      }
      return {
        board: board_state,
        boxes: boxes_state,
        vlines: vlines_state,
        hlines: hlines_state
      };

    }

    var state = mkState();

    var generateLine = function(line)
    {
      var items = [];
      for (var i = 0; i < N; i++)
      {
        var n = board[line[i]];
        if (n) items.push(n);
      }
      items.sort();
      return items;
    };

    var checkLine = function(items)
    {
      for (var i = 1; i < items.length; i++)
        if (items[i-1] == items[i]) return INVALID;
      return items.length == N ? SOLVED : VALID;
    };

    var check = function( f, n )
    {
      var result = SOLVED;
      for (var i = 0; i < n; i++)
      {
        var r = f(i);
        if (r == INVALID) return r;
        if (r == VALID) result = VALID;
      }
      return result;
    };

    var checkLines = function(lines)
    {
      return check( function(i){ return checkLine(lines[i]); }, N );
    };

    var checkBoard = function()
    {
      var checks = [state.boxes, state.vlines, state.hlines];
      return check(function(i){ return checkLines(checks[i]); }, checks.length);
    };

    var checkSquare = function(square)
    {
      var checks = state.board[square];
      var ids = ['box', 'vline', 'hline'];
      return check(function(i){ return checkLine(checks[ids[i]]); }, ids.length);
    };

    var add = function(v, item){ v.push(item); };
    var swap = function(v, i, j){ var temp = v[i]; v[i] = v[j]; v[j] = temp; };
    var remove = function(v, item)
    {
      var i = v.findIndex(function(e, i, v){ return e == item; });
      if (i == -1) return;
      swap(v, i, v.length-1);
      v.pop();
    };

    var changeItem = function(v, before, after)
    {
      if (before) remove(v, before);
      if (after)  add(v, after);
      v.sort();
    };

    var doState = function(move)
    {
      changeItem(state.board[move.square].box,   move.before, move.after);
      changeItem(state.board[move.square].hline, move.before, move.after);
      changeItem(state.board[move.square].vline, move.before, move.after);
    };

    var undoState = function(move)
    {
      changeItem(state.board[move.square].box,   move.after, move.before);
      changeItem(state.board[move.square].hline, move.after, move.before);
      changeItem(state.board[move.square].vline, move.after, move.before);
    };

    var put = function(square, value)
    {
      var move = { square: square, before: board[square], after: value };
      moves.push( move );
      board[square] = value;
      doState(move);
      return checkSquare(square);
    };

    var get = function(square)
    {
      return board[square];
    };

    var undo = function()
    {
      if (moves.length > 0)
      {
        var move = moves.pop();
        board[move.square] = move.after;
        undoState(move);
        return move;
      }
    };

    var boardString = function()
    {
      var s = '';
      for (var i = 0; i < N; i++)
      {
        for (var j = 0; j < N; j++)
        {
          var n = board[i*N+j];
          s += (n ? n : ' ');
        }
        s += "\n";
      }
      return s;
    };

    var toString = function()
    {
      return "\nboxes "  + JSON.stringify(state.boxes, null, 2) +
             "\nvlines " + JSON.stringify(state.vlines, null, 2) +
             "\nhlines " + JSON.stringify(state.hlines, null, 2);
    };

    return {
       put: put,
       get: get,
       moves: moves,
       board: board,
       undo: undo,
       checkBoard: checkBoard,
       checkSquare: checkSquare,
       state: state,
       toString: toString
    };
  });

  app.directive(
    "board",
    function()
    {
      return {
        restrict: "E",
        replace: true,
        templateUrl: "board.html"
      };
    }
  );

  app.directive(
    "lines",
    function()
    {
      return {
        restrict: "E",
        replace: true,
        templateUrl: "lines.html"
      };
    }
  );

  app.directive(
    "moves",
    function()
    {
      return {
        restrict: "E",
        replace: true,
        templateUrl: "moves.html"
      };
    }
  );

  app.directive(
    "box",
    function()
    {
      return {
        restrict: "E",
        scope: { root: '@' },
        replace: true,
        templateUrl: "box.html",
      };
    }
  );

  app.directive(
    "cell",
    function()
    {
      return {
        restrict: "E",
        scope: { index: '@' },
        replace: true,
        templateUrl: "cell.html",
        link: function(scope, element, attr)
        {
          var sudoku = element.injector().get("sudoku");
          var square = Number(attr.index);

          scope.value = '';
          scope.change = function()
          {
            sudoku.put( square, scope.value );
          };
        }
      };
    }
  );
