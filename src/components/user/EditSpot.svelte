<script>
import { goto, params } from "@roxi/routify";

import { editSpotData, userData } from "./../../js/store.js";
import { getSpotById } from "../../js/api/spot.js";
import { isEmpty, loadFromLocalStorage } from "../../js/utils/commonUtils.js";

import Spinner from "../elements/Spinner.svelte";
import SpotForm from "../SpotForm.svelte";

const { id, username } = $params;
const token = loadFromLocalStorage("token") || null;

$: if (
  $userData.username &&
  $userData.username !== username &&
  $editSpotData.approvedOwners &&
  !$editSpotData.approvedOwners?.some((owner) => owner?.username !== username)
) {
  $goto("/404");
}

const getSpotData = async () => {
  if ($editSpotData.id) {
    return $editSpotData;
  }

  const { success, result, errors } = await getSpotById(token, id);

  if (success && result) {
    const { user } = result;

    if (user.username !== username) {
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
    <SpotForm editSpotData={$editSpotData} onCancel={goBack} />
  </div>
{/await}

<style>
.edit-spot {
  position: relative;
  width: 100%;
  max-width: 938px;
}
</style>
