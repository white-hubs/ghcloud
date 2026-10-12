import { defineComponent } from "vue";

export const VisitingDataPic = defineComponent({
  name: "VisitingDataPic",
  props: {
    img: { type: String, required: true },
  },
  setup(props) {
    return (): JSX.Element => (
      <div class="contanier">
        <img src={props.img} class="aniamtion-pulse" alt="" />
      </div>
    );
  },
});

export default VisitingDataPic;
