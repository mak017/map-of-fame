<script>
import { goto, params } from "@roxi/routify";

import { editSpotData, userData } from "./../../store.js";
import { getSpotById } from "../../api/spot.js";
import { isEmpty, loadFromLocalStorage } from "../../utils/commonUtils.js";

import ButtonModalBack from "../elements/ButtonModalBack.svelte";
import SpotForm from "../SpotForm.svelte";
import Spinner from "../elements/Spinner.svelte";

const { id, username } = $params;
const strippedUsername = username.substring(1);
const token = loadFromLocalStorage("token") || null;

$: if ($userData.username && $userData.username !== strippedUsername) {
  $goto("/404");
}

const getSpotData = async () => {
  if ($editSpotData.id) {
    return $editSpotData;
  }

  const { success, result, errors } = await getSpotById(token, id);

  if (success && result) {
    const { user } = result;

    if (user.username !== strippedUsername) {
      $goto("/404");
      throw new Error();
    }

    editSpotData.set(result);
    return result;
  }

  if (errors && !isEmpty(errors)) {
    $goto("/404");
  }
};

const goBack = () => {
  editSpotData.set({});
  window.history.back();
};
</script>

{#await getSpotData()}
  <Spinner height={40} margin="auto" />
{:then}
  <div class="edit-spot">
    <ButtonModalBack on:click={goBack} editSpot />
    <h2>Edit Art</h2>
    <SpotForm editSpotData={$editSpotData} onCancel={goBack} />
  </div>
{/await}

<style>
.edit-spot {
  position: relative;
  width: 100%;
  max-width: 938px;
  margin-top: 80px;
}
h2 {
  margin: -20px 0 66px;
  color: var(--color-dark);
  font-size: 24px;
  font-weight: 900;
  line-height: 1.22;
  text-transform: uppercase;
}

@media (max-width: 767px) {
  .edit-spot {
    margin-top: 50px;
  }
  h2 {
    margin-bottom: 24px;
  }
}
</style>
