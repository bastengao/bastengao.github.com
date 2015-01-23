window.addEventListener('load', function (e) {

// Now set up your game (most games will load a separate .js file)
  var Q = Quintus({imagePath: "http://bastengao.com/assets/soldier/"})  // Create a new engine instance
      .include("Sprites, Scenes, Input, 2D, Touch, UI") // Load any needed modules
      .setup({width: 900, height: 600})                           // Add a canvas element onto the page
      .touch();                          // Add in touch support (for the UI)


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
      this._super(p, {
        asset: 'target.png',
        w: 128,
        h: 128
      });

      this.on("shooted", this, "shooted");
    },

    shooted: function (aimTo) {
      if (this.p.shooted) {
        return;
      }

      var x = aimTo[0], y = aimTo[1];
      if (x > (this.p.x - this.p.cx) && x < (this.p.x + this.p.cx) && y > (this.p.y - this.p.cy) && y < (this.p.y + this.p.cy)) {
        this.p.shooted = true;
        this.set({asset: 'target_down.png', w: 50, y: this.p.y + 75});
      }
    }
  });

  Q.MovingSprite.extend("RangeTarget", {
    init: function(p) {
      this._super({asset: 'target.png', x: 300, y: 200, w: 128, h: 128, vx: 100, vy: 0, ax: 0, ay: 0});

      this.on("shooted", this, "shooted");
    },

    step: function(dt){
      this._super(dt);
      if(this.p.x > 600) {
        this.p.vx = -100
      } else if(this.p.x < 300){
        this.p.vx = 100
      }
    },

    shooted: function (aimTo) {
      if (this.p.shooted) {
        return;
      }

      var x = aimTo[0], y = aimTo[1];
      if (x > (this.p.x - this.p.cx) && x < (this.p.x + this.p.cx) && y > (this.p.y - this.p.cy) && y < (this.p.y + this.p.cy)) {
        this.p.shooted = true;
        this.p.vx = 0;
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

  var level = 0;

  var aim = new Q.Cross();
  Q.scene("level1", function (stage) {
    // gray background
    stage.insert(new Q.UI.Container({fill: "#eee", x: 450, y: 300, w: 900, h: 600}));

    var container = stage.insert(new Q.UI.Container({
      fill: "gray",
      border: 5,
      shadow: 10,
      shadowColor: "rgba(0,0,0,0.5)",
      y: 30,
      x: Q.width / 2
    }));

    stage.insert(new Q.UI.Text({
      label: "神枪手 Level 1",
      color: "white",
      x: 0,
      y: 0
    }), container);

    container.fit(10, 50);

    stage.insert(aim);
    var shoot_man = new Q.Sprite({asset: 'shoot_man_burned.png', x: 800, y: 530, w: 298, h: 203, angle: 10, scale: .8});
    stage.insert(shoot_man);
    stage.insert(new Q.Target({x: 250, y: 200}));
    stage.insert(new Q.Target({x: 450, y: 200}));
    stage.insert(new Q.Target({x: 650, y: 200}));

    stage.on('shooted', this, function (aimTo) {
      console.log('fired');
      var targets = Q('Target', 0);
      targets.trigger('shooted', aimTo);

      setTimeout(function () {
        var all_shooted = true;
        targets.each(function () {
          if (this.p.shooted) {
          } else {
            all_shooted = false;
          }
        });

        if (all_shooted) {
          stage.insert(new Q.UI.Text({label: "闯关成功", size: 50, color: "blue", x: 450, y: 300}));
          setTimeout(function () {
            level = 1;
            Q.stageScene('level2');
          }, 3000);
        }
      }, 1000);
    });
  });

  var aim2 = new Q.Cross();
  Q.scene('level2', function (stage) {
    stage.insert(new Q.UI.Container({fill: "#eee", x: 450, y: 300, w: 900, h: 600}));

    var container = stage.insert(new Q.UI.Container({
      fill: "gray",
      border: 5,
      shadow: 10,
      shadowColor: "rgba(0,0,0,0.5)",
      y: 30,
      x: Q.width / 2
    }));

    stage.insert(new Q.UI.Text({
      label: "神枪手 Level 2",
      color: "white",
      x: 0,
      y: 0
    }), container);

    container.fit(10, 50);

    var shoot_man = new Q.Sprite({asset: 'shoot_man_burned.png', x: 800, y: 530, w: 298, h: 203, angle: 10, scale: .8});
    stage.insert(shoot_man);
    stage.insert(aim2);
    stage.insert(new Q.RangeTarget());

    stage.on('shooted', function(aimTo){
      var rangeTarget = Q('RangeTarget');
      rangeTarget.trigger('shooted', aimTo);


      setTimeout(function(){
        console.log(rangeTarget.first());
        if(rangeTarget.first().p.shooted){
          stage.insert(new Q.UI.Text({label: "闯关成功", size: 50, color: "blue", x: 450, y: 300}))
        }
      }, 500);
    });
  });


  Q.load("man.png, cross-64.png, target.png, target_down.png, shoot_man_burned.png", function () {
    Q.stageScene("level1");

    // Q.debug = true;
    // Q.debugFill = true;

    Q.el.addEventListener('mousemove', function (e) {
      var x = e.offsetX || e.layerX,
          y = e.offsetY || e.layerY,
          stage = Q.stage();

      var stageX = Q.canvasToStageX(x, stage),
          stageY = Q.canvasToStageY(y, stage);

      var obj = stage.locate(stageX, stageY);

      if (level == 0) {
        aim.set({x: stageX, y: stageY})
      } else if (level == 1) {
        aim2.set({x: stageX, y: stageY})
      }
    });

    Q.el.addEventListener('mousedown', function (e) {
      var x = e.offsetX || e.layerX,
          y = e.offsetY || e.layerY,
          stage = Q.stage();

      var stageX = Q.canvasToStageX(x, stage),
          stageY = Q.canvasToStageY(y, stage);

      if (level == 0) {
        Q.stage().trigger('shooted', [stageX, stageY]);
      } else if (level == 1) {
        Q.stage().trigger('shooted', [stageX, stageY]);
      }
      console.log('mousedown', [stageX, stageY]);
    });
  });

});
