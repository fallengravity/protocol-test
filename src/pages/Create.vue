<template>
  <div>
    <q-card
      class="my-card"
      style="margin: 2%;"
    >
      <q-card-section>
        <q-form>
          <q-input
            v-model="name"
            filled
            prefix="Item Name:"
            name="name"
            style="margin: 2%; margin-top: 0.5%"
          />
          <q-input
            v-model="description"
            filled
            prefix="Item description:"
            name="description"
            autogrow
            style="margin: 2%"
          />
          <q-file
            v-model="model"
            filled
            name="image"
            style="margin: 2%; padding-right: 4%;"
          >
            <template #prepend>
              <q-icon name="cloud_upload" />
            </template>
          </q-file>
          <div>
            <q-btn
              label="Submit"
              color="primary"
              style="margin-left: 2%"
              @click="mint"
            />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </div>
</template>
<script>
import erc721 from '../assets/ERC721.json';

export default {
  name: 'Mint',
  data() {
    return {
      single: {},
      description: '',
      name: '',
      model: null,
      contractJson: [],
    };
  },
  mounted() {
    /* if (this.$API.userAccount === undefined) {
      this.$API.onboard.walletReset();
      this.$API.init();
    } */
  },
  methods: {
    async mint() {
      this.single = new this.$API.web3.eth.Contract(erc721, '0x25646B08D9796CedA5FB8CE0105a51820740C049');
      // Pinata Config
      const pinataOptions = JSON.stringify({
        wrapWithDirectory: true,
      });
      const account = this.$API.userAccount[0].toString();
      this.$axios.get(`http://api-staging.rarible.com/protocol/v0.1/ethereum/nft/collections/0xed2dff3672795c89dad8a8162026838ffd818b82/generate_token_id?minter=${account}`).then((res) => {
        // Set tokenId
        const { tokenId } = res.data;
        // Upload Image to IPFS
        const formData = new FormData();
        formData.append('file', this.model);
        console.log(this.model.name, 'Model');
        formData.append('pinataOptions', pinataOptions);
        this.$axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
          headers: {
            'Content-Type': 'multipart/form-data;',
            pinata_api_key: '0875b8e8741fdfcf73c6',
            pinata_secret_api_key: '967474b055d2ee855dd4d7a503867a63036d2dad65ba417367df120a6ced6d51',
          },
        }).then((data) => {
          console.log(data.data.IpfsHash);
          // Construct Metadata
          const newDataArray = {
            name: this.name.toString(),
            description: this.description.toString(),
            image: `/ipfs/${data.data.IpfsHash}/${this.model.name}`,
            external_url: `https://rinkeby.rarible.com/token/0xed2dff3672795c89dad8a8162026838ffd818b82:${tokenId}`,
          };
          // this.contractJson.push(newDataArray);
          // Upload Metadata to IPFS
          this.$axios.post('https://api.pinata.cloud/pinning/pinJSONToIPFS', newDataArray, {
            headers: {
              'Content-Type': 'application/json',
              pinata_api_key: '0875b8e8741fdfcf73c6',
              pinata_secret_api_key: '967474b055d2ee855dd4d7a503867a63036d2dad65ba417367df120a6ced6d51',
            },
          }).then((final) => {
            // Mint Token
            console.log(final.data.IpfsHash, 'Metadata Hash');
            const item = this.single.methods.mintAndTransfer([
              tokenId,
              `/ipfs/${final.data.IpfsHash}`,
              [account],
              [['0x6C1AaC9EAd0a2c0D328309fbb2cf940F49d26126', 100], ['0xb2a9dfA14119195AD987fd728D1E438819B71655', 80]],
              ['0x0000000000000000000000000000000000000000000000000000000000000000'],
            ],
            this.$API.userAccount[0]);
            this.$API.web3.eth.sendTransaction({
              data: item.encodeABI(),
              to: '0x25646B08D9796CedA5FB8CE0105a51820740C049',
              from: this.$API.userAccount[0],
              chainId: 4,
            }).then((tx) => {
              console.log(tx);
              const itemId = `0x25646B08D9796CedA5FB8CE0105a51820740C049:${tokenId}`;
              const mongoSave = {
                itemId: itemId.replace(':', '%3A'),
                tokenId,
              };
              console.log(`TokenId: ${tokenId}`);
              this.$axios.post('http://localhost:3000/itemIds', mongoSave);
            });
          });
        });
      });
    },
  },
};
</script>
