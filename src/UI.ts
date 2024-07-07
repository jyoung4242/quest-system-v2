import { gamestate } from "./gamestate";

export const model = {
  clickhandler: () => {
    gamestate.player.monstersKilled += 1;
    console.log("killing monster", gamestate.player.monstersKilled);
  },
  testEvent: () => {
    const myEvent = new CustomEvent("testEvent", {
      detail: {
        test: "test",
      },
    });
    document.dispatchEvent(myEvent);
  },
  cancelQuest: () => {
    gamestate.cancel = true;
  },
};
export const template = `
<style> 
    canvas{ 
        position: fixed; 
        top:50%; 
        left:50%; 
        transform: translate(-50% , -50%); 
    }
        .buttondiv{
            position: fixed;
            top: 30%;
            left: 50%;
            transform: translate(-50% , -50%);
        }

        #cy{
          position: fixed;
          top: 55%;
          left: 50%;
          transform: translate(-50% , -50%);
        }
</style> 
<div id="root"> 
    <canvas id='cnv'> </canvas> 
    <div class="buttondiv">
      <button \${click@=>clickhandler}>kill monster</button>
      <button \${click@=>testEvent}>game event</button>
      <button \${click@=>cancelQuest}>Cancel Quest</button>
    </div>
    
    
</div>`;
