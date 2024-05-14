/**
* @component RoadTiles
* @description A Vue component that represents a road with nodes.
* @path src/components/road/RoadTiles.vue
*/

/**
* @template
* @description The template section of the RoadTiles component.
*/
<template>
  <ButtonComponent v-if="savingGoalId < 0" class="button" @click="createSavingGoal()">
      <template v-slot:content>
          <h2>Kom i gang!</h2>
        </template>
    </ButtonComponent>
  <div class="road-container">
    <div class="background-img" :class="darkMode ? 'background-dark' : 'background-light'"></div>
    <div class="road-box">

      <div v-if="goal > 0" class="road-edge-point road-end">
        <text v-if="roadComplete" class="complete-text">Klikk for å fullføre!</text>
        <div class="road-edge-area saving-goal" :class="{'node-end': roadComplete}"  @click="saved >= goal ? completeSavingGoal() : goToSavingGoal()">
          <img v-if="roadComplete" class="walking-end-pig" @click="triggerConfetti" :src="endpig"></img>
          <img v-if="savingGoalImage.length > 4" :src="savingGoalImage" class="saving-goal-image"></img>
          <p v-else class="emoji">{{ savingGoalImage }}</p>
        </div>
      </div>

      <div class="road-tile" v-for="(road) in roads" :key="road.id">
        <div class="road-amount-text" :class="`road-amount-text-${road.direction}` + ((road.arrived || road.moved) ? ' text-completed' : '')" >{{ road.amount }}</div>
        <img class="road-node" 
          :class="['road-node-' + road.direction , { 'road-completed': road.amount <= saved}]" 
          :src="road.emoji">
          <img v-if="(road.arrived || road.moved)" :src="comleteImg" class="road-completed-img" :class="'road-node-' + road.direction"></img>
      </img>
        <div v-if="roads[road.id].arrived" 
          class="start-area-pig" 
          :class="'start-area-' + road.direction">
          <img class="walking-pig" :class="'pig-' + road.id" :src="road.pig" ></img>
        </div>
        <svg class="road-svg" :class="'road-' + road.direction + (darkMode ? '-dark' : '-light' )"></svg>
      </div>

      <div class="road-edge-point road-start">
        <div class="road-edge-area" id="node-start">
          <img v-if="!startmoved" class="walking-pig walking-pig-start" :src="startpig">{{ saved + " / " + goal}}</img>
        </div>
      </div>
    </div>
  </div>
</template>

/**
* @script
* @description The script section of the RoadTiles component.
*/
<script setup lang="ts">
import { onMounted, ref, nextTick, watchEffect, watch } from "vue";
import { useUserStore } from "@/stores/userStore";
import { useLogin } from "@/api/authenticationHooks";
import { getCurrentSavingGoal, completeCurrentSavingGoal, savingGoalListener } from "@/api/savingGoalHooks";
import { Howl } from 'howler';
import plingSound from "/pling.wav";
import yaySound from "/yay.wav";
import confetti from 'canvas-confetti';
import { useDark } from "@vueuse/core";
import { useRouter } from "vue-router";
import ButtonComponent from "@/components/assets/ButtonComponent.vue";

const startpig = ref("/animation/pig-sitting-right.png");
const endpig = "/animation/dancing-pig.gif";
const startmoved = ref(false);
const comleteImg = ref("/animation/gold-coin-spin.gif");
const roadComplete = ref(false);
const roadCompleteSound = ref(false);
const showConfetti = ref(false);
const darkMode = useDark();
const savingGoalImage = ref('');
const router = useRouter();

const goal = ref(0);
const saved = ref(0);
const step = ref(0);

const savingGoalId = ref(-1);

function goToSavingGoal() {
  if (savingGoalId.value > 0) {
    router.push(`/saving-goal/details/${savingGoalId.value}`);
  }
}


  /**
   * Function to complete the current saving goal
   */
async function completeSavingGoal() {
  try {
    const res = await completeCurrentSavingGoal();
    if (res && res === 200) {
      router.push('/saving-goal/create');
    }
  } catch(error) {
    alert("You have not reached your goal yet!");
  }
}

/**
 * Function to create a new saving goal
 */
function createSavingGoal() {
  router.push(`/saving-goal/create`);
}

/**
 * Road interface to represent a road
 */
interface Road {
  id: number;
  amount: number,
  emoji: string;
  direction: string;
  moved: boolean;
  pig: string;
  arrived: boolean;
  soundPlayed?: boolean;
}
const roads = ref<Road[]>([]);
const addRoad = (amount: number) => {
  const direction = roads.value.length % 2 === 0 ? 'right' : 'left';
  const moved = false;
  const pig = '/animation/pig-sitting-' + direction + '.png';
  const houseNr = Math.floor(Math.random()*8) + 1;

  roads.value.push({id: roads.value.length, amount, emoji: "/house-" + houseNr + ".png", direction, moved, pig, arrived: false});
};

/**
 * Function to move the pig at the start of the road
 */
function moveStart(): Promise<void> {
  return new Promise((resolve) => {
    startpig.value = "/animation/pig-walking-" + (roads.value.length%2 === 0 ? 'right' : 'left') + ".gif";
    const pig = document.getElementsByClassName('walking-pig-start')[0];
    if(pig) {
      pig.classList.add('animation-pig-start-' + roads.value[roads.value.length-1].direction);
    }
    pig.addEventListener('animationend', () => {
      pig.classList.remove('animation-pig-start-' + roads.value[roads.value.length-1].direction);
      startmoved.value = true;
      roads.value[roads.value.length - 1].arrived = true;
      resolve(); 
    }, { once: true }); 
  });

}
/**
 * Function to move the pig on the road
 * @param road The road to move the pig on
 */
function movePig(road: Road): Promise<void> {
  return new Promise((resolve) => {
    if (!goal || !road || road.amount > saved.value || roads.value.length === 1) {
      return;
    } else if(road.moved === false && road.amount < saved.value){

      road.pig = `/animation/pig-walking-${roads.value[road.id].direction}.gif`;
      const pig = document.getElementsByClassName('pig-' + (road.id))[0];
      if(pig){
        pig.classList.add('animation-pig-' + road.direction);
      }
      
      pig.addEventListener('animationend', () => {
        road.pig = '/animation/pig-sitting.png';
        road.arrived = false;
        road.moved = true;
        pig.classList.remove('animation-pig-' + road.direction);
        roads.value[road.id-1].arrived = true;
        resolve(); 
      }, { once: true }); 
    } 
  });
}
/**
 * Function to move the pig at the end of the road when the goal is reached
 */
function moveEnd(): Promise<void> {
  return new Promise((resolve) => {
    roads.value[0].pig = `/animation/pig-walking-${roads.value[0].direction}.gif`;
    const pig = document.getElementsByClassName('pig-0')[0];
    if(pig){
      pig.classList.add('animation-pig-end-' + roads.value[0].direction);
    }
    pig.addEventListener('animationend', () => {
      pig.classList.remove('animation-pig-end-' + roads.value[0].direction);
      roads.value[0].arrived = false;
      roads.value[0].moved = true;
      roadComplete.value = true;
      resolve(); 
    }, { once: true }); 
  });
}

const userStore = useUserStore();

/**
 * Function to update the current saving goal
 */
const updateSavingGoal = async () => {
  try {
    let savingGoal = await getCurrentSavingGoal();
    if (savingGoal) {
      goal.value = savingGoal.targetAmount;
      saved.value = savingGoal.savedAmount;
      savingGoalImage.value = savingGoal.mediaUrl || '';
      savingGoalId.value = savingGoal.id;
    } else {
      goal.value = 0;
      saved.value = 0;
    }
  } catch (error) {
    console.log("No saving goal found");
  }
};

/**
 * Function to add to the saved amount
 * @param amount The amount to add to the saved amount
 */
watch(savingGoalListener, async () => {
  await updateSavingGoal();
}); 


onMounted(async () => {
  if (!userStore.isLoggedIn()) {
    useLogin();
  }
  await updateSavingGoal();
  
  step.value = 100;
  const steps = Math.floor(goal.value / step.value);


  for(let i = steps; i > 0; i--){
    const amount = (i*100);
    addRoad(amount);
  }
  
  // Create the first moves when loading and the roads have been placed
  nextTick(async () => {
    try{
    if(roads.value.length <= 0){
    } else {
    for (let i = roads.value.length; i >= 0; i--) {
      if (roads.value[i] && roads.value[i].amount <= saved.value) {
        if (i === roads.value.length - 1) {
          await moveStart();
        }
        if (roads.value[i-1] && roads.value[i - 1].amount <= saved.value) {
          await movePig(roads.value[i]);
        }
      } 
    }

    if (goal.value !== 0 && goal.value <= saved.value) {
        await moveEnd();
    }
  }
  } catch (error) {
    throw new Error("No roads found");
  }
  });
});

/**
 * Function to trigger the confetti animation
 */
const triggerConfetti = () => {
  if(userStore.getMuted) return;
  showConfetti.value = true;
  let scalar = 2;
  let coin = confetti.shapeFromText({text: '💰', scalar})

  // Configure custom shape options for confetti
  const confettiOptions = {
    particleCount: 100, // Number of confetti particles
    spread: 70, // Spread of confetti
    origin: { y: 0.6 }, // Starting position of confetti
    sizes: [20, 30], // Size of the confetti particles (coins)
    shapes: [coin], // Shape of the confetti particles (coins)
    scalar,
  };
  // Trigger confetti with custom options
  confetti(confettiOptions);
  
  // Optionally, set a timeout to hide the confetti after a certain duration
  setTimeout(() => {
    showConfetti.value = false;
  }, 5000); // 5000 milliseconds (adjust as needed)
};

/**
 * Function to play the pling sound
 */
const playPlingSound = () => {
  if (userStore.getMuted) return;
  const sound = new Howl({
    src: [plingSound],
    volume: 0.1,
    autoplay: true,
    loop: false,
  });
};

/**
 * Function to play the yay sound
 */
const playYaySound = () => {
  if (userStore.getMuted) return;
  const sound = new Howl({
    src: [yaySound],
    volume: 0.1,
    autoplay: true,
    loop: false,
  });
};

/**
 * Watcher to check if the roads have been completed
 */
watchEffect(() => {
  if(userStore.getMuted) return;
  roads.value.forEach(road => {
    if (road.arrived && !road.soundPlayed) {
      road.soundPlayed = true;
      playPlingSound();
    }
  });
  if (roadComplete.value && !roadCompleteSound.value) {
      roadCompleteSound.value = true;
      triggerConfetti();
      playYaySound();
  }
});
</script>


/**
* @style
* @description The style section of the RoadTiles component.
*/
<style scoped>
#node-start {
  background-size: 100% 100%;
  color: var(--color-text);
  font-weight: bold;
  font-size: 24px;
}

.node-end{
  background-size: auto auto;
  background-color: var(--color-badges-owned);
}

.complete-text{
  position: absolute;
  top: -30px;
  font-size: 18px;
}


/* Complete Container */
.road-container {
  position: relative;
  width: auto;
  height: auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  overflow-x: hidden;
}
.road-box {
  position: relative;
  align-items: center;
  justify-content: center;
  min-width: 520px;
  overflow: hidden;
  scrollbar-width: none;
  -ms-overflow-style: none;
  padding-top: 45px;
  padding-bottom: 90px;
}

.background-img{
  position: fixed;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0px;
  z-index: -1;
}
.background-light{
  background: url("/svg_icons/background-light.svg");
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
}
.background-dark{
  background: url("/svg_icons/background-dark.svg");
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
}

/* Edges of the road. The start and end point */
.road-edge-point {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 900;
}
.road-edge-area {
  position: relative;
  border-radius: 5px;
  margin-top: -2px;
  width: 250px;
  height: 150px;
  border: 2px solid var(--color-road-border);
  background-color: var(--color-road-background);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: black;
  font: 24px;
  z-index: -1;
}
.road-start{
  position: relative;
  z-index: 500;
}
.road-end{
  position: relative;
  z-index: 500;
  margin-top: 20px;
}

/* Road Tiles */
.road-node {
  position: absolute;
  color: var(--color-text);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-size: 18px;
  background-size: cover;
  object-fit: contain;
  border-radius: 5px;
  background: var(--color-road-background);
  border: 2px solid var(--color-road-border);

}
.road-node-right {
  margin-top: 2px;
  height: 137px;
  width: 94px;
  right: 65px;
}
.road-node-left {
  height: 130px;
  width: 91px;
  left: 64px;
}
.road-amount-text {
  position: absolute;
  margin-top: 95px;
  width: 100px;
  text-align: center;
  font-size: 18px;
  font-weight: bold;
  color: var(--text-color);
  z-index: 501;
}
.road-amount-text-left {
  left: 50%;
  transform: translateX(-50%);
}
.road-amount-text-right {
  right: 50%;
  transform: translateX(50%);
}
.text-completed {
  font-size: 38px;
  color: gold;
  margin-top: 80px;
}
.road-completed {
  background-color: var(--color-badges-owned);
}
.road-completed-img {
  position: absolute;
  width: 90px;
  height: 90px;
  z-index: 10;
  display: flex;
  justify-content: center;
  align-items: center;

}
.road-svg {
  display: flex;
  justify-content: center;
  resize: none;
}

/* Pig start position */
.start-area-pig{
  position: absolute;
  width: 10px;
  height: 0px;
  margin-top: 105px;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: visible;
  z-index: 500;
}
.start-area-right{
  right: 170px;
}
.start-area-left{
  left: 170px;
}

.saving-goal-image {
  width: 100%;
  height: auto;
}

.emoji {
  font-size: 6em;
}

.saving-goal {
  cursor: pointer;
  transition: box-shadow 0.3s;
  transition: transform 0.3s ease;
}

.saving-goal:hover {
  box-shadow: 0 0 20px var(--color-badges-owned);
  transform: scale(1.05);
}

.button {
  margin: 1rem auto;
  cursor: pointer;
  width: 200px;
  height: 50px;
  position: relative;
  top: 0;
  z-index: 900;
}
/* Pig */
.walking-pig{
  width: 40px;
  height: 40px;
  position: absolute;
  color: var(--color-text);
}
.walking-end-pig{
  width: 80px;
  height: 80px;
  position: absolute;
}

/* Pig animation */
.animation-pig-start-left{
  animation: pig-walking-start-left 3s ease-in-out;
}
.animation-pig-start-right{
  animation: pig-walking-start-right 3s ease-in-out;
}
.animation-pig-left{
  animation: pig-walking-left 3s ease-in-out;
}
.animation-pig-right{
  animation: pig-walking-right 3s ease-in-out;
}
.animation-pig-end-left{
  animation: pig-walking-end-left 3s ease-in-out;
}
.animation-pig-end-right{
  animation: pig-walking-end-right 3s ease-in-out;
}
@keyframes pig-walking-start-right {
  0% {
    transform: translateX(-90px) translateY(0px);
  }
  30% {
    transform: translateX(-90px) translateY(-100px);
  }
  70% {
    transform: translateX(85px) translateY(-100px);
  }
  100% {
    transform: translateX(85px) translateY(-145px);
  }
}
@keyframes pig-walking-start-left {
  0% {
    transform: translateX(90px) translateY(0px);
  }
  30% {
    transform: translateX(90px) translateY(-100px);
  }
  70% {
    transform: translateX(-85px) translateY(-100px);
  }
  100% {
    transform: translateX(-85px) translateY(-145px);
  }
}
@keyframes pig-walking-left {
  0% {
    transform: translateX(0px) translateY(0px);
  }
  40% {
    transform: translateX(0px) translateY(-135px);
  }
  70% {
    transform: translateX(170px) translateY(-135px);
  }
  100% {
    transform: translateX(170px) translateY(-180px);
  }
}
@keyframes pig-walking-right {
  0% {
    transform: translateX(0px) translateY(0px);
  }
  40% {
    transform: translateX(0px) translateY(-135px);
  }
  70% {
    transform: translateX(-170px) translateY(-135px);
  }
  100% {
    transform: translateX(-170px) translateY(-180px);
  }
}
@keyframes pig-walking-end-left {
  0% {
    transform: translateX(0px) translateY(0px);
  }
  30% {
    transform: translateX(0px) translateY(-140px);
  }
  70% {
    transform: translateX(85px) translateY(-140px);
  }
  100% {
    transform: translateX(85px) translateY(-180px);
  }
}
@keyframes pig-walking-end-right {
  0% {
    transform: translateX(0px) translateY(0px);
  }
  30% {
    transform: translateX(0px) translateY(-140px);
  }
  70% {
    transform: translateX(-85px) translateY(-140px);
  }
  100% {
    transform: translateX(-85px) translateY(-180px);
  }
}

@media screen and (max-width: 481px) {}
</style>