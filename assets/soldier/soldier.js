window.addEventListener('load', function (e) {

// Now set up your game (most games will load a separate .js file)
  var Q = Quintus({imagePath: "http://bastengao/assets/soldier/"})  // Create a new engine instance
      .include("Sprites, Scenes, Input, 2D, Touch, UI") // Load any needed modules
      .setup({width: 900, height: 600})                           // Add a canvas element onto the page
      .controls()                        // Add in default controls (keyboard, buttons)
      .touch();                          // Add in touch support (for the UI)

  /*
   ... Actual game code goes here ...
   */

  Q.Sprite.extend("Soldier", {
    init: function (p) {
      this._super({
        x: 100,
        y: 100,
        asset: "man.png"
      });
    }
  });

  Q.Sprite.extend("Target", {
    init: function (p) {
      this._super({
        asset: 'target.png',
        x: 200,
        y: 200,
        w: 128,
        h: 128
      });

      this.on("shooted", this, "shooted");
    },

    shooted: function(aimTo) {
      if(this.p.shooted) {
        return;
      }

      console.log(aimTo);
      console.log(this.p);
      var x = aimTo[0], y = aimTo[1];
      if(x > (this.p.x - this.p.cx) && x < (this.p.x + this.p.cx) && y > (this.p.y - this.p.cy) && y < (this.p.y + this.p.cy)){
        this.p.shooted = true;
        this.set({asset: 'target_down.png', w: 50, y: this.p.y + 75});
      }
    }
  });

  Q.Sprite.extend("Cross", {
    init: function (p) {
      this._super({
        x: 100,
        y: 100,
        w: 64,
        h: 64,
        angle: 45,
        scale: 0.8,
        asset: "cross-64.png"
      });
    }
  });

  var aim = new Q.Cross();

  // var target = new Q.Sprite({asset: 'target.png', x: 200, y: 200, w: 128, h: 128});
  var target = new Q.Target();

  var shoot_man = new Q.Sprite({asset: 'shoot_man_burned.png', x: 800, y: 530, w: 298, h: 203, angle: 10, scale: .8});

  Q.scene("start", function (stage) {
    stage.insert(new Q.UI.Container({
      fill: "#eee",
      x: 450,
      y: 300,
      w: 900,
      h: 600
    }));

    var container = stage.insert(new Q.UI.Container({
      fill: "gray",
      border: 5,
      shadow: 10,
      shadowColor: "rgba(0,0,0,0.5)",
      y: 30,
      x: Q.width / 2
    }));

    stage.insert(new Q.UI.Text({
      label: "神枪手",
      color: "white",
      x: 0,
      y: 0
    }), container);

    container.fit(10, 50);

    stage.insert(aim);
    stage.insert(target);
    stage.insert(new Q.Target({x: 300, y: 300}));
    stage.insert(shoot_man);
  });

  Q.load("man.png, cross-64.png, target.png, target_down.png, shoot_man_burned.png", function () {
    Q.stageScene("start");

    // Q.debug = true;
    // Q.debugFill = true;

    Q.el.addEventListener('mousemove', function (e) {
      var x = e.offsetX || e.layerX,
          y = e.offsetY || e.layerY,
          stage = Q.stage();

      var stageX = Q.canvasToStageX(x, stage),
          stageY = Q.canvasToStageY(y, stage);

      var obj = stage.locate(stageX, stageY);

      aim.set({x: stageX, y: stageY})
    });

    Q.el.addEventListener('mousedown', function (e) {
      var x = e.offsetX || e.layerX,
          y = e.offsetY || e.layerY,
          stage = Q.stage();

      var stageX = Q.canvasToStageX(x, stage),
          stageY = Q.canvasToStageY(y, stage);

      var obj = stage.locate(stageX, stageY);

      var targets = Q('Target');
      targets.trigger('shooted', [stageX, stageY]);
      console.log('mousedown', [stageX, stageY]);
    });
  });

});
